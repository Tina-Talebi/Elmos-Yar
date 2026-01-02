import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewsList({ reviews, isLoading }) {
    const getSentimentBadge = (tag, score) => {
        if (tag === 'positive' || score > 0.3) {
            return <Badge className="bg-green-100 text-green-700 gap-1">
                <ThumbsUp className="w-3 h-3" />
                مثبت
            </Badge>;
        }
        if (tag === 'negative' || score < -0.3) {
            return <Badge className="bg-red-100 text-red-700 gap-1">
                <ThumbsDown className="w-3 h-3" />
                منفی
            </Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-700 gap-1">
            <Minus className="w-3 h-3" />
            خنثی
        </Badge>;
    };

    if (isLoading) {
        return (
            <Card className="border-blue-200">
                <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-blue-200">
            <CardHeader>
                <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    نظرات دانشجویان ({reviews.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        هنوز نظری ثبت نشده است
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review, idx) => (
                            <div
                                key={review.id || idx}
                                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {review.course_name}
                                        </Badge>
                                        {review.term && (
                                            <Badge variant="outline" className="text-xs">
                                                <Calendar className="w-3 h-3 ml-1" />
                                                {review.term}
                                            </Badge>
                                        )}
                                        {getSentimentBadge(review.sentiment_tag, review.sentiment_score)}
                                    </div>
                                    {review.rating_6 && (
                                        <div className="text-sm font-bold text-blue-900">
                                            {review.rating_6}/10
                                        </div>
                                    )}
                                </div>

                                {review.comments && (
                                    <p className="text-gray-700 leading-relaxed mb-3">
                                        {review.comments}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    {review.grading_encoded && (
                                        <div>
                                            <span className="font-medium">نمره‌دهی:</span> {review.grading_encoded}
                                        </div>
                                    )}
                                    {review.attendance_encoded && (
                                        <div>
                                            <span className="font-medium">حضور:</span> {review.attendance_encoded}
                                        </div>
                                    )}
                                    {review.exam_encoded && (
                                        <div>
                                            <span className="font-medium">امتحان:</span> {review.exam_encoded}
                                        </div>
                                    )}
                                </div>

                                {review.created_date && (
                                    <div className="text-xs text-gray-500 mt-2">
                                        {format(new Date(review.created_date), 'yyyy/MM/dd')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}