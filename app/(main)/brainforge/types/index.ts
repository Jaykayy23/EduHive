// brainforge/types/index.ts

export interface Question {
  question_statement: string;
  question_type: string;
  answer: string | boolean;
  options?: string[];
  context?: string;
}

export interface GeneratedResponse {
  source_text: string;
  questions: Question[];
}
