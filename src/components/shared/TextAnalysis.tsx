'use client';

import React, { useMemo } from 'react';
import { Card, CardTitle } from '@/components/ui/card';

const FA_STOPWORDS = new Set([
  'و', 'در', 'به', 'از', 'که', 'این', 'است', 'را', 'با', 'یک', 'برای', 'شد',
  'آن', 'شود', 'شده', 'بود', 'داشت', 'هم', 'تا', 'می', 'کند', 'کرد',
  'دارد', 'همه', 'اما', 'اگر', 'دهد', 'خیلی', 'بودن', 'نیست', 'هست', 'کس'
]);

export default function TextAnalysis({ reviews }: { reviews: any[] }) {
  const wordData = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    // استخراج متن از فیلدهای احتمالی (comments یا comment_text)
    const allText = reviews
      .map((r) => r.comments || r.comment_text || r.text || "")
      .join(" ");

    const words = allText
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟!]/g, "")
      .split(/\s+/);

    const freqMap: Record<string, number> = {};
    words.forEach((word) => {
      const cleanWord = word.trim();
      // حذف کلمات کوتاه و Stopwords
      if (cleanWord.length > 2 && !FA_STOPWORDS.has(cleanWord)) {
        freqMap[cleanWord] = (freqMap[cleanWord] || 0) + 1;
      }
    });

    return Object.entries(freqMap)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 40); // ۴۰ کلمه برتر
  }, [reviews]);

  if (wordData.length === 0) {
    return (
      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 text-center text-slate-400 font-bold">
        دیتای متنی کافی برای تحلیل وجود ندارد.
      </Card>
    );
  }

  // پیدا کردن بیشترین تکرار برای محاسبه نسبت اندازه فونت
  const maxFreq = Math.max(...wordData.map(w => w.value));

  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
      <CardTitle className="text-xl font-black mb-10 text-right">کلمات پرتکرار در نظرات</CardTitle>
      
      {/* نمایش کلمات با استایل ابر کلمات */}
      <div className="flex flex-wrap justify-center items-center gap-4 min-h-[300px] p-4 bg-slate-50/50 rounded-3xl" dir="rtl">
        {wordData.map((word, index) => {
          // محاسبه اندازه فونت بین 14px تا 48px بر اساس تکرار
          const fontSize = Math.max(14, Math.min(48, (word.value / maxFreq) * 48));
          const opacity = Math.max(0.4, (word.value / maxFreq));
          const colors = ['text-blue-600', 'text-emerald-600', 'text-amber-600', 'text-indigo-600', 'text-rose-600'];
          
          return (
            <span
              key={index}
              className={`${colors[index % colors.length]} font-black transition-all hover:scale-110 cursor-default`}
              style={{ 
                fontSize: `${fontSize}px`,
                opacity: opacity
              }}
              title={`تکرار: ${word.value}`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </Card>
  );
}