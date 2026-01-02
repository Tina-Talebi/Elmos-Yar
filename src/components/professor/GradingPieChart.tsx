import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function GradingPieChart({ easy, fair, hard }) {
    const data = [
        { name: 'آسان', value: easy, color: '#22c55e' },
        { name: 'منصفانه', value: fair, color: '#3b82f6' },
        { name: 'سخت‌گیر', value: hard, color: '#ef4444' }
    ].filter(item => item.value > 0);

    return (
        <Card className="border-blue-200">
            <CardHeader>
                <CardTitle className="text-xl text-blue-900">توزیع نمره‌دهی</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                        داده‌ای برای نمایش وجود ندارد
                    </div>
                )}
            </CardContent>
        </Card>
    );
}