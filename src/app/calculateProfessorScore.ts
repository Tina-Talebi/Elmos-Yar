type ProfAgg = {
    review_count: number;
    avg_rating_1: number;
    avg_rating_2: number;
    avg_rating_3: number;
    avg_rating_4: number;
    avg_rating_5: number;
    avg_rating_6: number;
  };
  
  export function calculateProfessorScore(p: ProfAgg): number {
    const weightedAvg =
      p.avg_rating_1 * 0.15 + // پیوستگی تدریس
      p.avg_rating_2 * 0.20 + // دانش عمومی
      p.avg_rating_3 * 0.25 + // انتقال مطالب
      p.avg_rating_4 * 0.20 + // مدیریت کلاس
      p.avg_rating_5 * 0.10 + // پاسخگویی
      p.avg_rating_6 * 0.10;  // رفتار اجتماعی
  
    // ضریب اطمینان (جلوگیری از باد شدن با نظر کم)
    const confidence = Math.min(p.review_count / 10, 1);
  
    return Number((weightedAvg * confidence).toFixed(2));
  }
  