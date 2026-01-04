export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface Review {
  professor_id: number;
  professor_name_standard: string;
  department: string;

  rating_1?: number;
  rating_2?: number;
  rating_3?: number;
  rating_4?: number;
  rating_5?: number;
  rating_6?: number;

  final_sentiment?: Sentiment;
  confidence?: number;
  grading?: string;

  // بقیه فیلدهایی که داری
}
