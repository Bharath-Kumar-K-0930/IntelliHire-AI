import { createRequire } from 'module';
import fs from 'fs';
import { getGeminiResponse } from '../ai/service.js';

// Use createRequire for robust CJS import of pdf-parse v1.1.1
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export const extractTextFromFile = async (file) => {
    const { path, mimetype } = file;

    try {
        if (mimetype === 'application/pdf') {
            const dataBuffer = await fs.promises.readFile(path);
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (mimetype === 'text/plain') {
            return await fs.promises.readFile(path, 'utf8');
        } else {
            console.error('Unsupported format:', mimetype);
            // Treat as text if possible?
            try {
                return await fs.promises.readFile(path, 'utf8');
            } catch (e) {
                throw new Error('Unsupported file format and text read failed');
            }
        }
    } catch (error) {
        console.error('Text extraction failed:', error);
        throw new Error(`Failed to extract text: ${error.message}`);
    }
};

export const extractProfileData = async (text) => {
    const prompt = `
    You are an expert Resume Parser AI. Your task is to extract ALL relevant information from the resume text below.
    
    IMPORTANT INSTRUCTIONS:
    1. Extract EVERY skill mentioned (technical, soft skills, tools, frameworks, languages)
    2. Extract ALL work experience entries with complete details
    3. Extract ALL education entries (degrees, certifications, courses)
    4. Extract ALL projects with their tech stacks
    5. Extract ALL internships
    6. Extract complete contact information
    7. Extract hobbies/interests if mentioned
    8. Create a comprehensive professional summary
    9. Return ONLY valid JSON, no markdown formatting
    
    Target JSON Structure (fill ALL fields you find):
    {
      "name": "Full Name",
      "role": "Current or desired job role (e.g. Full Stack Developer, Data Scientist)",
      "skills": ["List ALL technical skills, programming languages, frameworks, tools, databases, cloud platforms, etc."],
      "experience": [
        { 
          "title": "Job Title", 
          "company": "Company Name", 
          "duration": "Start Date - End Date or Present", 
          "description": "Key responsibilities and achievements",
          "location": "City, Country (if mentioned)"
        }
      ],
      "education": [
        { 
          "degree": "Degree Name (e.g. B.Tech in Computer Science)", 
          "institution": "University/College Name", 
          "year": "Graduation Year or Duration",
          "grade": "GPA/Percentage (if mentioned)"
        }
      ],
      "projects": [
         { 
           "title": "Project Name", 
           "description": "Detailed description of the project", 
           "techStack": ["Technologies used"],
           "link": "GitHub/Demo link (if mentioned)"
         }
      ],
      "internships": [
         { 
           "title": "Role/Position", 
           "company": "Company Name", 
           "duration": "Start - End Date", 
           "description": "Work done and learnings",
           "location": "City (if mentioned)"
         }
      ],
      "certifications": [
         {
           "name": "Certification Name",
           "issuer": "Issuing Organization",
           "date": "Issue Date"
         }
      ],
      "contact": {
        "email": "email@example.com",
        "phone": "+1234567890",
        "linkedin": "LinkedIn profile URL",
        "github": "GitHub profile URL",
        "portfolio": "Portfolio website URL",
        "location": "City, State, Country"
      },
      "hobbies": ["Hobby 1", "Hobby 2", "Interest 1"],
      "languages": ["English - Fluent", "Spanish - Intermediate"],
      "summary": "A comprehensive 2-3 sentence professional summary highlighting key strengths, experience, and career goals"
    }

    Resume Text:
    ${text.substring(0, 15000)}
    
    Return ONLY the JSON object, no additional text or markdown.
    `;

    try {
        const rawResponse = await getGeminiResponse(prompt);
        const jsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Profile extraction AI failed:", error);
        // Fallback to basic extraction
        return basicExtractionFallback(text);
    }
};

const basicExtractionFallback = (text) => {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9-]+)/gi;
    const githubRegex = /(github\.com\/[a-zA-Z0-9-]+)/gi;

    const commonSkills = ['React', 'Node', 'JavaScript', 'Python', 'Java', 'HTML', 'CSS', 'SQL',
        'MongoDB', 'Express', 'Angular', 'Vue', 'TypeScript', 'AWS', 'Docker',
        'Kubernetes', 'Git', 'REST API', 'GraphQL', 'PostgreSQL', 'MySQL'];
    const skills = commonSkills.filter(s => text.toLowerCase().includes(s.toLowerCase()));

    return {
        name: "Unknown",
        role: "Unknown",
        skills: skills.length > 0 ? skills : ["Not extracted"],
        experience: [],
        education: [],
        projects: [],
        internships: [],
        certifications: [],
        contact: {
            email: (text.match(emailRegex) || [])[0] || "",
            phone: (text.match(phoneRegex) || [])[0] || "",
            linkedin: (text.match(linkedinRegex) || [])[0] || "",
            github: (text.match(githubRegex) || [])[0] || "",
            portfolio: "",
            location: ""
        },
        hobbies: [],
        languages: [],
        summary: "Basic extraction - AI processing failed. Please re-upload resume or check API key."
    };
};

export const getSkillOverlap = (resumeText, jobDescription) => {
    // Keep legacy function if needed, or remove if unused. 
    // It was used in jobsService? No, jobsService uses Gemini.
    // Leaving it to avoid breaking other imports.
    const commonSkills = [
        'react', 'node', 'javascript', 'python', 'java', 'typescript', 'aws',
        'docker', 'kubernetes', 'mongodb', 'postgresql', 'redis', 'tailwindcss',
        'css', 'html', 'git', 'fastify', 'express', 'next.js', 'figma'
    ];
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();
    const matchedSkills = commonSkills.filter(skill =>
        resumeLower.includes(skill) && jobLower.includes(skill)
    );
    return (matchedSkills.length / commonSkills.filter(s => jobLower.includes(s)).length) * 100 || 0;
};
