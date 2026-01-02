import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RATING_LABELS = [
  'کیفیت تدریس',
  'مدیریت کلاس',
  'تسلط علمی',
  'تعامل',
  'پاسخگویی',
  'امتیاز کلی'
];

const COLORS = ['#1e3a5f', '#2563eb', '#0891b2', '#059669', '#d97706'];

export default function CompareChart({ professors }) {
  const data = RATING_LABELS.map((label, idx) => {
    const item = { name: label };
    professors.forEach((prof, pIdx) => {
      item[prof.name_standard] = prof[`avg_rating_${idx + 1}`] || 0;
    });
    return item;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b' }} />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={90}
          tick={{ fill: '#475569', fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            direction: 'rtl'
          }}
          formatter={(value) => [value.toFixed(1), '']}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {professors.map((prof, idx) => (
          <Bar 
            key={prof.id} 
            dataKey={prof.name_standard} 
            fill={COLORS[idx % COLORS.length]} 
            radius={[0, 4, 4, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}