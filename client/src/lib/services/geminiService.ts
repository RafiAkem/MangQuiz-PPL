import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiQuestionRequest {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
  topic?: string;
}

export interface GeminiQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
}

export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static model: any = null;

  static isConfigured(): boolean {
    return !!import.meta.env.VITE_GEMINI_API_KEY;
  }

  static initialize(): void {
    if (!this.isConfigured()) {
      throw new Error("Gemini API key not configured");
    }

    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      this.initialize();
      const result = await this.model.generateContent("Hello");
      return !!result.response.text();
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      return false;
    }
  }

  static async generateQuestions(
    request: GeminiQuestionRequest
  ): Promise<GeminiQuestion[]> {
    this.initialize();

    const prompt = this.buildPrompt(request);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse the response to extract questions
      const questions = this.parseQuestions(response, request.count);

      if (questions.length === 0) {
        throw new Error("Failed to generate valid questions");
      }

      return questions;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw new Error("Failed to generate questions. Please try again.");
    }
  }

  private static buildPrompt(request: GeminiQuestionRequest): string {
    const { category, difficulty, count, topic } = request;

    const topicText = topic ? ` focused on ${topic}` : "";
    const difficultyText = this.getDifficultyDescription(difficulty);

    return `Generate ${count} multiple choice trivia questions about ${category}${topicText}. 
    
Requirements:
- Difficulty level: ${difficultyText}
- Each question should have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should be engaging and educational
- Include a brief explanation for the correct answer

Format each question as JSON:
{
  "id": "unique_id",
  "category": "${category}",
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "difficulty": "${difficulty}",
  "explanation": "Brief explanation of why this is correct"
}

Return only valid JSON array of questions, no additional text.`;
  }

  private static getDifficultyDescription(difficulty: string): string {
    switch (difficulty) {
      case "easy":
        return "Basic knowledge, suitable for beginners";
      case "medium":
        return "Intermediate knowledge, requires some study";
      case "hard":
        return "Advanced knowledge, challenging for experts";
      default:
        return "Mixed difficulty levels";
    }
  }

  private static parseQuestions(
    response: string,
    expectedCount: number
  ): GeminiQuestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const questions = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }

      // Validate and clean up questions
      const validQuestions = questions
        .filter((q) => this.validateQuestion(q))
        .map((q, index) => ({
          ...q,
          id: q.id || `gemini_${Date.now()}_${index}`,
          correctAnswer:
            typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          difficulty: q.difficulty || "medium",
        }))
        .slice(0, expectedCount);

      return validQuestions;
    } catch (error) {
      console.error("Failed to parse questions:", error);
      console.error("Raw response:", response);
      throw new Error("Failed to parse generated questions");
    }
  }

  private static validateQuestion(question: any): boolean {
    return (
      question &&
      typeof question.question === "string" &&
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      typeof question.correctAnswer === "number" &&
      question.correctAnswer >= 0 &&
      question.correctAnswer < 4
    );
  }
}
