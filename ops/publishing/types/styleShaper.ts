export type StyleShaperContentType = "note" | "insight" | "essay" | "research";

export interface StyleShaperInput {
  text: string;
  contentType: StyleShaperContentType;
  phenomenonType?: string;
}

export interface StyleShaperScores {
  rhythm: number;
  compression: number;
  memorability: number;
}

export interface StyleShaperOutput {
  revisedText: string;
  scores: StyleShaperScores;
  changes: string[];
}
