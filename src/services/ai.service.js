const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('[AI] GEMINI_API_KEY missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// ── Chatbot ──────────────────────────────────────────────────────
const askCourseQuestion = async (question, course) => {
  // Agar lessons nahi hain to generic answer do
  const courseContext = course.lessons?.length > 0
    ? course.lessons
        .map((l, i) => `Lesson ${i + 1}: ${l.title}\n${l.content || ''}`)
        .join('\n\n')
    : `Course: ${course.title}\n${course.description}`;

  const prompt = `
You are a helpful AI tutor for the course: "${course.title}".
Answer student questions based on the course content below.
If the question is unrelated, politely say you can only help with this course.
Be clear, friendly and educational.

--- COURSE CONTENT ---
${courseContext}
--- END ---

Student question: ${question}

Answer:`;

  const result   = await model.generateContent(prompt);
  return result.response.text();
};

// ── Quiz generator ───────────────────────────────────────────────
const generateQuiz = async (course, numberOfQuestions = 5) => {
  const courseContext = course.lessons?.length > 0
    ? course.lessons
        .map((l, i) => `Lesson ${i + 1}: ${l.title}\n${l.content || ''}`)
        .join('\n\n')
    : `Course: ${course.title}\n${course.description}`;

  const prompt = `
You are a quiz creator for the course: "${course.title}".
Create exactly ${numberOfQuestions} multiple choice questions based on the content below.

Return ONLY a valid JSON array. No markdown, no code blocks, no extra text.

Each object must have:
{
  "question": "question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "exact text of correct option",
  "explanation": "why this is correct"
}

Rules:
- Exactly 4 options per question
- correctAnswer must exactly match one option
- Mix easy, medium, hard questions

--- COURSE CONTENT ---
${courseContext}
--- END ---

JSON array:`;

  const result = await model.generateContent(prompt);
  const text   = result.response.text();

  // Strip markdown code blocks if Gemini added them
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g,      '')
    .trim();

  let questions;
  try {
    questions = JSON.parse(cleaned);
  } catch (e) {
    console.error('[AI] JSON parse failed:', cleaned.substring(0, 200));
    throw new Error('Gemini returned invalid JSON. Try again.');
  }

  if (!Array.isArray(questions)) {
    throw new Error('Gemini did not return an array.');
  }

  // Validate each question
  questions.forEach((q, i) => {
    if (!q.question)                          throw new Error(`Q${i+1}: missing question`);
    if (!Array.isArray(q.options))            throw new Error(`Q${i+1}: missing options`);
    if (q.options.length !== 4)               throw new Error(`Q${i+1}: need exactly 4 options`);
    if (!q.correctAnswer)                     throw new Error(`Q${i+1}: missing correctAnswer`);
    if (!q.options.includes(q.correctAnswer)) throw new Error(`Q${i+1}: correctAnswer not in options`);
  });

  return questions;
};

module.exports = { askCourseQuestion, generateQuiz };