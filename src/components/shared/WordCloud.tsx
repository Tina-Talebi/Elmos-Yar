import React, { useMemo } from 'react';

// Persian stop words to filter out
const PERSIAN_STOP_WORDS = new Set([
  'و', 'در', 'به', 'از', 'که', 'این', 'را', 'با', 'است', 'برای',
  'آن', 'یک', 'خود', 'تا', 'کرد', 'بر', 'هم', 'نیز', 'گفت', 'می',
  'شد', 'او', 'ما', 'ها', 'های', 'شده', 'بود', 'دارد', 'همه', 'اما',
  'یا', 'هر', 'باید', 'بین', 'کند', 'داشت', 'خیلی', 'اگر', 'چون', 'پس',
  'دیگر', 'کنید', 'کنه', 'میشه', 'نمیشه', 'استاد', 'درس', 'نظر', 'خوب', 
  'بد', 'هست', 'نیست', 'شما', 'من', 'بودن', 'کردن', 'شدن', 'داشتن'
]);

const COLORS = [
  '#1e3a5f', '#2563eb', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#db2777', '#0d9488', '#4f46e5'
];

export default function WordCloud({ comments = [], maxWords = 40 }) {
  const wordCounts = useMemo(() => {
    const counts = {};
    
    comments.forEach(comment => {
      if (!comment) return;
      // Split by spaces and clean
      const words = comment
        .replace(/[،.!؟?؛:()«»\[\]{}]/g, ' ')
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 2 && !PERSIAN_STOP_WORDS.has(w) && !/^\d+$/.test(w));
      
      words.forEach(word => {
        counts[word] = (counts[word] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords)
      .map(([word, count]) => ({ word, count }));
  }, [comments, maxWords]);

  if (wordCounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        داده‌ای برای نمایش وجود ندارد
      </div>
    );
  }

  const maxCount = Math.max(...wordCounts.map(w => w.count));
  const minCount = Math.min(...wordCounts.map(w => w.count));

  const getFontSize = (count) => {
    const minSize = 12;
    const maxSize = 36;
    if (maxCount === minCount) return (minSize + maxSize) / 2;
    return minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center p-4 min-h-[200px]">
      {wordCounts.map((item, index) => (
        <span
          key={item.word}
          className="transition-all duration-200 hover:scale-110 cursor-default"
          style={{
            fontSize: `${getFontSize(item.count)}px`,
            color: COLORS[index % COLORS.length],
            fontWeight: item.count > (maxCount * 0.7) ? 700 : 500,
            opacity: 0.7 + (item.count / maxCount) * 0.3
          }}
          title={`${item.word}: ${item.count} بار`}
        >
          {item.word}
        </span>
      ))}
    </div>
  );
}