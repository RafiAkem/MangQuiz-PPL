import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiQuestionRequest {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
  topic?: string;
  indonesiaMode?: boolean;
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

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  isConfigured(): boolean {
    return !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  }

  initialize(): void {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log("[GeminiService] Initialized with server-side API key");
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      this.initialize();
      const result = await this.model.generateContent("Hello");
      return !!result.response.text();
    } catch (error) {
      console.error("[GeminiService] Connection test failed:", error);
      return false;
    }
  }

  async generateQuestions(
    request: GeminiQuestionRequest
  ): Promise<GeminiQuestion[]> {
    this.initialize();

    const prompt = this.buildPrompt(request);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      const questions = this.parseQuestions(response, request.count);

      if (questions.length === 0) {
        throw new Error("Failed to generate valid questions");
      }

      return questions;
    } catch (error) {
      console.error("[GeminiService] Error generating questions:", error);
      throw new Error("Failed to generate questions. Please try again.");
    }
  }

  private buildPrompt(request: GeminiQuestionRequest): string {
    const { category, difficulty, count, topic, indonesiaMode } = request;

    const topicText = topic ? ` focused on ${topic}` : "";
    const difficultyText = this.getDifficultyDescription(difficulty);

    if (indonesiaMode) {
      return `Buatkan ${count} soal trivia pilihan ganda tentang Indonesia (sejarah, budaya, geografi, politik, tokoh terkenal Indonesia)${topicText}. 
    
Persyaratan:
- Tingkat kesulitan: ${difficultyText}
- Setiap soal harus memiliki tepat 4 pilihan (A, B, C, D)
- Hanya satu jawaban benar per soal
- Soal harus menarik dan edukatif tentang Indonesia
- Sertakan penjelasan singkat untuk jawaban yang benar
- SEMUA teks harus dalam Bahasa Indonesia (soal, pilihan jawaban, dan penjelasan)

Format setiap soal sebagai JSON:
{
  "id": "unique_id",
  "category": "Indonesia",
  "question": "Teks pertanyaan di sini?",
  "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
  "correctAnswer": 0,
  "difficulty": "${difficulty}",
  "explanation": "Penjelasan singkat mengapa ini benar"
}

Kembalikan hanya array JSON yang valid, tanpa teks tambahan.`;
    }

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

  private getDifficultyDescription(difficulty: string): string {
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

  private parseQuestions(
    response: string,
    expectedCount: number
  ): GeminiQuestion[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const questions = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }

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
      console.error("[GeminiService] Failed to parse questions:", error);
      throw new Error("Failed to parse generated questions");
    }
  }

  private validateQuestion(question: any): boolean {
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

export const geminiService = new GeminiService();
