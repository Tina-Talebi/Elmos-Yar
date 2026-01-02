import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ComparisonChart({ professors }) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Prepare data for different metrics
    const ratingData = [
        { category: 'تدریس', ...Object.fromEntries(professors.map((p, i) => [p.name_standard, p.avg_rating_1 || 0])) },
        { category: 'مدیریت کلاس', ...Object.fromEntries(professors.map((p, i) => [p.name_standard, p.avg_rating_2 || 0])) },
        { category: 'تسلط علمی', ...Object.fromEntries(professors.map((p, i) => [p.name_standard, p.avg_rating_3 || 0])) },
        { category: 'تعامل', ...Object.fromEntries(professors.map((p, i) => [p.name_standard, p.avg_rating_4 || 0])) },
        { category: 'پاسخگویی', ...Object.fromEntries(professors.map((p, i) => [p.name_standard, p.avg_rating_5 || 0])) }
    ];

    const gradingData = [
        { 
            category: 'نمره‌دهی',
            ...Object.fromEntries(professors.map(p => [
                `${p.name_standard}_آسان`,
                p.grading_easy_pct || 0
            ])),
            ...Object.fromEntries(professors.map(p => [
                `${p.name_standard}_سخت`,
                p.grading_hard_pct || 0
            ]))
        }
    ];

    return (
        <div className="space-y-6">
            {/* Ratings Comparison */}
            <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-blue-900">
                        مقایسه امتیازها
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={ratingData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="category"
                                tick={{ fill: '#475569', fontSize: 12 }}
                            />
                            <YAxis domain={[0, 10]} tick={{ fill: '#475569' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    direction: 'rtl'
                                }}
                            />
                            <Legend />
                            {professors.map((prof, idx) => (
                                <Bar
                                    key={prof.id}
                                    dataKey={prof.name_standard}
                                    fill={colors[idx]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Overall Rating Comparison */}
            <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-blue-900">
                        امتیاز کلی و تعداد نظرات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={professors.map(p => ({
                                name: p.name_standard,
                                'امتیاز کلی': p.avg_rating_6 || 0,
                                'تعداد نظرات': (p.review_count || 0) / 10
                            }))}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#475569', fontSize: 11 }}
                                angle={-15}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis tick={{ fill: '#475569' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    direction: 'rtl'
                                }}
                                formatter={(value, name) => {
                                    if (name === 'تعداد نظرات') {
                                        return [Math.round(value * 10), name];
                                    }
                                    return [value.toFixed(1), name];
                                }}
                            />
                            <Legend />
                            <Bar dataKey="امتیاز کلی" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="تعداد نظرات" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}