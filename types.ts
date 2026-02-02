export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export enum ModelType {
  TUTOR = 'gemini-3-pro-preview', // High reasoning, thinking budget
  FAST = 'gemini-2.5-flash-lite-latest', // Quick answers
}
