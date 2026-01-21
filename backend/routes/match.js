import { getGeminiResponse, parseMatchingResult } from '../ai/service.js';
import { getSkillOverlap } from '../utils/parser.js';
import redis from '../redis/client.js';

export default async function matchRoutes(fastify, options) {
  fastify.post('/match', async (request, reply) => {
    const { job } = request.body;
    const userId = request.headers['x-user-id'] || 'default-user';

    const resumeText = await redis.get(`resume:${userId}`);
    if (!resumeText) return reply.code(400).send({ error: 'Please upload a resume first' });

    // Hybrid Matching Logic
    const skillScore = getSkillOverlap(resumeText, job.description);

    const prompt = `
      You are an AI job matching engine.
      Your task is to evaluate how well a candidate's resume matches a given job description.

      Candidate Resume:
      """
      ${resumeText}
      """

      Job Description:
      """
      Job Title: ${job.title}
      Company: ${job.company}
      Location: ${job.location}
      Job Type: ${job.jobType}
      Work Mode: ${job.workMode}

      Job Description:
      ${job.description}
      """

      Instructions:
      1. Score the match between the resume and the job on a scale of 0-100.
      2. Consider: Skill overlap, Relevant experience, Seniority alignment, Tools & technologies.
      3. Penalize missing critical skills.
      4. Do NOT assume skills not mentioned in the resume.
      5. Return ONLY valid JSON in the following format:
      {
        "matchScore": number,
        "strengths": [ "short reason 1", "short reason 2", "short reason 3" ],
        "missingSkills": [ "skill1", "skill2" ]
      }
    `;

    const aiResponse = await getGeminiResponse(prompt);
    const aiResult = parseMatchingResult(aiResponse);

    // Final Score Calculation
    const finalScore = Math.round((skillScore * 0.6) + (aiResult.matchScore * 0.4));

    const result = {
      ...aiResult,
      matchScore: finalScore,
      jobId: job.jobId
    };

    // Cache match result
    let matches = await redis.get(`matches:${userId}`);
    matches = matches ? JSON.parse(matches) : [];
    const index = matches.findIndex(m => m.jobId === job.jobId);
    if (index > -1) matches[index] = result;
    else matches.push(result);

    await redis.set(`matches:${userId}`, JSON.stringify(matches));

    return result;
  });
}
