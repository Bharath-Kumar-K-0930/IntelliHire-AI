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
        - role: string (e.g. "developer", "designer")
        - location: string (e.g. "London", "Remote")
        - skills: string (comma separated, e.g. "react, node")
        - jobType: "full_time", "contract", "part_time", "permanent"
        - datePosted: "24h", "week", "month"
        - minScore: "high" (>70%), "medium" (>40%)
      - NAVIGATE: Use when user asks to see specific pages. Payload keys: 'path'.
        - path: "/applications", "/resume", "/jobs"
      - NONE: Product questions or general chat. Payload: {}

      User Context:
      - Resume: ${resumeText ? 'Uploaded' : 'Not uploaded'}
      - Logged In: ${userId !== 'default-user'}

      Common Questions:
      - "Where are my applications?" -> NAVIGATE to /applications
      - "Upload resume" -> NAVIGATE to /resume
      - "High match jobs" -> FILTER with minScore: 'high'
      - "Remote React jobs" -> FILTER with location: 'Remote', skills: 'react'
      - "Jobs posted this week" -> FILTER with datePosted: 'week'

      Keep the "text" strict, professional, and concise. Do not use markdown in the JSON "text" field.
    `;

        const fullPrompt = `${systemPrompt}\n\nUser Message: ${message}`;

        try {
            const rawText = await getGeminiResponse(fullPrompt);
            // Clean up markdown code blocks if Gemini adds them
            const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonText);

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
