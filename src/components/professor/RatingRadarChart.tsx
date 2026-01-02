import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

export default function RatingRadarChart({ ratings }) {
    const data = ratings.map(r => ({
        category: r.label,
        امتیاز: r.value
    }));

    return (
        <Card className="border-blue-200">
            <CardHeader>
                <CardTitle className="text-xl text-blue-900">تحلیل امتیازها</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={data}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis
                            dataKey="category"
                            tick={{ fill: '#475569', fontSize: 12 }}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} />
                        <Radar
                            name="امتیاز"
                            dataKey="امتیاز"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                        />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}