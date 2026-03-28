export enum Role {
  USER = 'user',
  BOT = 'bot'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface TFSubQuestion {
  id: string;
  text: string;
  correctAnswer: boolean;
  explanation?: string; // Thêm trường giải thích cho từng ý
}

export interface Question {
  id: number;
  type: 'multiple_choice' | 'true_false' | 'essay';
  question: string;
  context?: string; 
  options?: string[]; 
  correctAnswer?: string | boolean | any; 
  subQuestions?: TFSubQuestion[]; 
  explanation?: string; // Giải thích chung cho MCQ hoặc Essay
  userAnswer?: any;
}

export interface RevisionData {
  theory: string;
  questions: {
    part1: Question[]; 
    part2: Question[]; 
    part3: Question[]; 
  };
  evaluation?: string;
}