export interface AnalyzedNoun {
  germanWord: string;
  article: 'der' | 'die' | 'das';
  japaneseTranslation: string;
}

export interface AnalysisResult {
  nouns: AnalyzedNoun[];
  germanTranslation: string;
}

export interface RewriteChange {
  originalWord: string;
  rewrittenWord: string;
}

export interface RewriteResult {
  rewrittenJapanese: string;
  rewrittenGerman: string;
  changes: RewriteChange[];
  newNouns: AnalyzedNoun[];
}