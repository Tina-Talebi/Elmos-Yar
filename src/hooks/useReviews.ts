import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // مسیر صحیح برای فایلی که در public/data قرار داده‌اید
    fetch('/data/reviews_sentiment_analysis.csv')
      .then(res => res.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('دیتای CSV با موفقیت لود شد. تعداد ردیف:', results.data.length);
            setReviews(results.data);
            setLoading(false);
          },
          error: (err) => {
            console.error('خطا در پارس CSV:', err);
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error('فایل پیدا نشد:', err);
        setLoading(false);
      });
  }, []);

  return { reviews, loading };
};