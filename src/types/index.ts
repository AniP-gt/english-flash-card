export interface FlashCard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  isLearned: boolean;
  createdAt: number;
}

export type AppTab = 'study' | 'list' | 'add' | 'settings';
export type ListFilter = 'all' | 'learned' | 'unlearned';
