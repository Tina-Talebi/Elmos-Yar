import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ratingLabels = {
  rating_1: 'کیفیت تدریس',
  rating_2: 'مدیریت کلاس',
  rating_3: 'تسلط علمی',
  rating_4: 'تعامل',
  rating_5: 'پاسخگویی',
  rating_6: 'امتیاز کلی'
};

export default function RatingRadar({ professor, color = '#1e3a5f' }) {
  const data = [
    { subject: ratingLabels.rating_1, value: professor.avg_rating_1 || 0, fullMark: 10 },
    { subject: ratingLabels.rating_2, value: professor.avg_rating_2 || 0, fullMark: 10 },
    { subject: ratingLabels.rating_3, value: professor.avg_rating_3 || 0, fullMark: 10 },
    { subject: ratingLabels.rating_4, value: professor.avg_rating_4 || 0, fullMark: 10 },
    { subject: ratingLabels.rating_5, value: professor.avg_rating_5 || 0, fullMark: 10 },
    { subject: ratingLabels.rating_6, value: professor.avg_rating_6 || 0, fullMark: 10 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: '#475569', fontSize: 12 }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 10]} 
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickCount={6}
        />
        <Radar
          name="امتیاز"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}