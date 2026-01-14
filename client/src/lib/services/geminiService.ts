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

export class GeminiService {
  /**
   * Check if the Gemini API is configured on the server
   */
  static async isConfigured(): Promise<boolean> {
    try {
      const response = await fetch("/api/gemini/status");
      const data = await response.json();
      return data.configured === true;
    } catch (error) {
      console.error("[GeminiService] Error checking status:", error);
      return false;
    }
  }

  /**
   * Initialize is now a no-op since API is server-side
   * Kept for backward compatibility
   */
  static initialize(): void {
    // No-op: API key is now server-side only
    console.log("[GeminiService] Using server-side API");
  }

  /**
   * Test connection to the Gemini API via server
   */
  static async testConnection(): Promise<boolean> {
    return this.isConfigured();
  }

  /**
   * Generate trivia questions using the server-side Gemini API
   */
  static async generateQuestions(
    request: GeminiQuestionRequest
  ): Promise<GeminiQuestion[]> {
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error(errorData.error || "Too many requests. Please wait a minute.");
        }
        
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data = await response.json();
      return data.questions;
    } catch (error: any) {
      console.error("[GeminiService] Error generating questions:", error);
      throw new Error(error.message || "Failed to generate questions. Please try again.");
    }
  }
}
