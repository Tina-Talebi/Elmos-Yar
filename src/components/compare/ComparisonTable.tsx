import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

export default function ComparisonTable({ professors }) {
    const getGradingBadge = (prof) => {
        const easy = prof.grading_easy_pct || 0;
        const hard = prof.grading_hard_pct || 0;
        
        if (easy > hard && easy > 30) {
            return <Badge className="bg-green-100 text-green-800">آسان ({easy.toFixed(0)}%)</Badge>;
        }
        if (hard > easy && hard > 30) {
            return <Badge className="bg-red-100 text-red-800">سخت ({hard.toFixed(0)}%)</Badge>;
        }
        return <Badge className="bg-blue-100 text-blue-800">منصفانه</Badge>;
    };

    const getAttendanceIcon = (required) => {
        if (required === true) return <XCircle className="w-5 h-5 text-red-500" />;
        if (required === false) return <CheckCircle className="w-5 h-5 text-green-500" />;
        return <MinusCircle className="w-5 h-5 text-gray-400" />;
    };

    const getSentimentBadge = (score) => {
        if (!score) return <Badge variant="outline">نامشخص</Badge>;
        if (score > 0.3) return <Badge className="bg-green-100 text-green-700">مثبت</Badge>;
        if (score < -0.3) return <Badge className="bg-red-100 text-red-700">منفی</Badge>;
        return <Badge className="bg-gray-100 text-gray-700">خنثی</Badge>;
    };

    return (
        <Card className="border-blue-200 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl text-blue-900">
                    جدول مقایسه جزئیات
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-blue-50">
                                <TableHead className="font-bold text-blue-900">ویژگی</TableHead>
                                {professors.map(prof => (
                                    <TableHead key={prof.id} className="text-center font-bold text-blue-900">
                                        {prof.name_standard}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">دانشکده</TableCell>
                                {professors.map(prof => (
                                    <TableCell key={prof.id} className="text-center">
                                        {prof.department?.replace(/_/g, ' ')}
                                    </TableCell>
                                ))}
                            </TableRow>

                            <TableRow className="bg-blue-50/50">
                                <TableCell className="font-medium">امتیاز کلی</TableCell>
                                {professors.map(prof => (
                                    <TableCell key={prof.id} className="text-center">
                                        <span className="text-lg font-bold text-blue-900">
                                            {(prof.avg_rating_6 || 0).toFixed(1)}
                                        </span>
                                        /10
                                    </TableCell>
                                ))}
                            </TableRow>

                            <TableRow>
                                <TableCell className="font-medium">کیفیت تدریس</TableCell>
                                {professors.map(prof => (
                                    <TableCell key={prof.id} className="text-center">
                                        {(prof.avg_rating_1 || 0).toFixed(1)}
                                    </TableCell>
                                ))}
                            </TableRow>

                            <TableRow className="bg-blue-50/50">
                                <TableCell className="font-medium">تعامل</TableCell>
                                {professors.map(prof => (
                                    <TableCell key={prof.id} className="text-center">
                                        {(prof.avg_rating_4 || 0).toFixed(1)}
                                    </TableCell>
                                ))}
                            </TableRow>

                            <TableRow>
                                <TableCell className="font-medium">نمره‌دهی</TableCell>
                                {professors.map(prof => (
                                    <TableCell key={prof.id} className="text-center">
                                        {getGradingBadge(prof)}
                                    </TableCell>
                                ))}
                            </TableRow>

                            <TableRow className="bg-blue-50/50">
                                <TableCell className="font-medium">حضور آزاد</TableCell>
                                {professors.map(prof => (
                                    <TableCell key={prof.id} className="text-center">
                                        {getAttendanceIcon(prof.attendance_required)}
                                    </TableCell>
                                ))}
                            </TableRow>

                            <TableRow>
                                <TableCell className="font-medium">احساسات کلی</TableCell>
                                {professors.map(prof => (
                                    <TableCell key={prof.id} className="text-center">
                                        {getSentimentBadge(prof.avg_sentiment)}
                                    </TableCell>
                                ))}
                            </TableRow>

                            <TableRow className="bg-blue-50/50">
                                <TableCell className="font-medium">تعداد نظرات</TableCell>
                                {professors.map(prof => (
                                    <TableCell key={prof.id} className="text-center font-medium">
                                        {prof.review_count || 0}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}