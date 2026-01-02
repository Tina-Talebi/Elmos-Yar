// src/hooks/useReviews.ts
import { useState, useEffect } from 'react';

export type Review = {
  professor_id: number;
  professor_name_standard: string;
  department: string;
  course_name: string;
  rating_1: number;  // تدریس
  rating_2: number;  // مدیریت کلاس
  rating_3: number;  // تسلط
  rating_4: number;  // تعامل
  rating_5: number;  // پاسخگویی
  rating_6: number;  // نمره‌دهی / سخاوتمندی
  grading_encoded: 'آسان' | 'منصفانه' | 'سخت‌گیر';
  attendance_encoded?: string;
  exam_encoded?: string;
  sentiment_score: number;
  sentiment_tag?: string;
  comments: string;
  term: string;
};

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/reviews.json')
      .then((res) => {
        if (!res.ok) throw new Error('فایل داده پیدا نشد');
        return res.json();
      })
      .then((data) => {
        console.log('داده‌ها با موفقیت لود شدن:', data.length, 'نظر');
        setReviews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('خطا در لود داده:', err);
        setError('خطا در بارگذاری داده‌ها. مطمئن شوید reviews.json در public/data هست.');
        setLoading(false);
      });
  }, []);

  return { reviews, loading, error };
};