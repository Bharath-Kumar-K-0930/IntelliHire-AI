import { getGeminiResponse } from '../ai/service.js';
import redis from '../redis/client.js';

export default async function chatRoutes(fastify, options) {
  fastify.post('/chat', async (request, reply) => {
    const { message } = request.body;
    const userId = request.headers['x-user-id'] || 'default-user';

    const resumeText = await redis.get(`resume:${userId}`);
    const applications = await redis.get(`applications:${userId}`);
    const matches = await redis.get(`matches:${userId}`);

    const systemPrompt = `
      You are IntelliHire AI, an intelligent job search assistant.
      
      Your goal is to help users find jobs or answer questions about the platform.
      
      You must respond in valid JSON format:
      {
        "text": "Your friendly, helpful response text here.",
        "action": {
          "type": "FILTER" | "NAVIGATE" | "NONE",
          "payload": { ... }
        }
      }

      Action Types:
      - FILTER: Use when user wants to see jobs. Payload keys: 'role', 'location', 'skills', 'jobType', 'datePosted', 'minScore'.
        - role: string (e.g. "developer", "designer", "senior")
        - location: string (e.g. "London", "Remote")
        - skills: string (comma separated, e.g. "react, node, figma")
        - jobType: "full_time", "contract", "part_time", "permanent"
        - datePosted: "24h", "week", "month"
        - minScore: "high" (>70%), "medium" (>40%)
      - NAVIGATE: Use when user asks to see specific pages. Payload keys: 'path'.
        - path: "/applications", "/resume", "/jobs"
      - NONE: Product questions or general chat. Payload: {}

      User Context:
      - Resume: ${resumeText ? 'Uploaded' : 'Not uploaded'}
      - Logged In: ${userId !== 'default-user'}

      Intelligent Mapping Examples:
      - "Show me remote React jobs" -> FILTER { location: 'Remote', skills: 'react' }
      - "Give me UX jobs requiring Figma" -> FILTER { role: 'ux', skills: 'figma' }
      - "Which jobs have highest match scores?" -> FILTER { minScore: 'high' }
      - "Find senior roles posted this week" -> FILTER { role: 'senior', datePosted: 'week' }
      - "Where do I see my applications?" -> NAVIGATE { path: '/applications' }
      - "How do I upload my resume?" -> NAVIGATE { path: '/resume' }
      
      Product Knowledge:
      - "How does matching work?": Explain that we parse your uploaded PDF resume, compare it against job descriptions using Google Gemini AI, and assign a match score (0-100%) based on skills and experience.
      - "How do I apply?": Explain that clicking "Apply" takes you to the company's site, and we track the application status in your dashboard.

      Keep the "text" strict, professional, and concise. Do not use markdown in the JSON "text" field.
    `;

    const fullPrompt = `${systemPrompt}\n\nUser Message: ${message}`;

    try {
      const rawText = await getGeminiResponse(fullPrompt);

      // Extract JSON if wrapped in code blocks or mixed with text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : rawText;

      let result;
      try {
        result = JSON.parse(jsonText);
      } catch (e) {
        console.warn('AI Parsing Failed, fallback to raw text');
        result = {
          text: rawText, // Fallback to raw response if not JSON
          action: { type: 'NONE' }
        };
      }

      return result;
    } catch (error) {
      console.error('AI Processing Error:', error);
      // Fallback plain text response
      return {
        text: "I'm having trouble processing that request right now. Could you try rephrasing?",
        action: { type: 'NONE' }
      };
    }
  });
}
