const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client once at startup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We'll use gemini-1.5-flash — it's free tier, fast, and handles long prompts well
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ─── CHATBOT ─────────────────────────────────────────────────────
// Takes a student's question + course content and returns an answer.
//
// The key idea: we give Gemini the course lessons as "context" so it
// answers ONLY based on what the course teaches — not random internet facts.
// This is called RAG (Retrieval-Augmented Generation).

const askCourseQuestion = async (question, course) => {
  // Build a string of all lesson content from the course
  const courseContext = course.lessons
    .map((lesson, i) => `Lesson ${i + 1}: ${lesson.title}\n${lesson.content}`)
    .join('\n\n');

  // The prompt has three parts:
  // 1. A system instruction telling Gemini its role
  // 2. The course content as context
  // 3. The student's actual question
  const prompt = `
You are a helpful AI tutor for the course: "${course.title}".

Your job is to answer student questions based ONLY on the course content provided below.
If the question is not related to the course content, politely say you can only help with topics covered in this course.
Keep your answers clear, friendly and educational. Use examples when helpful.

--- COURSE CONTENT ---
${courseContext}
--- END OF COURSE CONTENT ---

Student's question: ${question}

Provide a clear and helpful answer:
`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
};

// ─── QUIZ GENERATOR ───────────────────────────────────────────────
// Takes course content and returns an array of MCQ objects.
//
// The trick here is asking Gemini to respond in pure JSON.
// We give it a strict schema so we can parse it reliably.

const generateQuiz = async (course, numberOfQuestions = 5) => {
  const courseContext = course.lessons
    .map((lesson, i) => `Lesson ${i + 1}: ${lesson.title}\n${lesson.content}`)
    .join('\n\n');

  // We explicitly tell Gemini:
  // - How many questions to make
  // - Exactly what JSON structure to return
  // - No extra text — just the JSON
  const prompt = `
You are a quiz creator for the course: "${course.title}".

Based on the course content below, create exactly ${numberOfQuestions} multiple choice questions (MCQs).

Return ONLY a valid JSON array — no extra text, no markdown, no code blocks, just the raw JSON array.

Each question must follow this exact structure:
{
  "question": "The question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact text of the correct option",
  "explanation": "Brief explanation of why this is correct"
}

Rules:
- Each question must have exactly 4 options
- correctAnswer must exactly match one of the options
- Questions should test understanding, not just memorization
- Vary difficulty: some easy, some medium, some hard

--- COURSE CONTENT ---
${courseContext}
--- END OF COURSE CONTENT ---

Return the JSON array now:
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Gemini sometimes wraps JSON in markdown code blocks like ```json ... ```
  // This strips those out before parsing
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const questions = JSON.parse(cleaned);

  // Validate structure — if Gemini returns garbage, fail clearly
  if (!Array.isArray(questions)) {
    throw new Error('Gemini did not return a valid array');
  }

  questions.forEach((q, i) => {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
      throw new Error(`Question ${i + 1} is missing required fields`);
    }
  });

  return questions;
};

module.exports = { askCourseQuestion, generateQuiz };