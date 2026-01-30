export interface TarotInfo {
  name: string;
  keywords: string[];
  imageUrl: string;
  imagePrompt: string;
}

export interface RationalSolution {
  title: string;
  advice: string;
  actionItem: string;
}

export interface EmotionalContent {
  title: string;
  content: string;
}

export interface Scenario {
  id: string;
  category: string;
  question: string;
  tarot: TarotInfo;
  rationalSolution: RationalSolution;
  emotionalContent: EmotionalContent;
}