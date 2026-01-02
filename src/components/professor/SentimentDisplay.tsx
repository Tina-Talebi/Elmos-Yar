import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export default function SentimentDisplay({ sentimentScore, reviews }) {
    const getSentimentIcon = () => {
        if (sentimentScore > 0.3) return <ThumbsUp className="w-12 h-12 text-green-600" />;
        if (sentimentScore < -0.3) return <ThumbsDown className="w-12 h-12 text-red-600" />;
        return <Minus className="w-12 h-12 text-gray-600" />;
    };

    const getSentimentText = () => {
        if (sentimentScore > 0.3) return 'نظرات عمدتاً مثبت';
        if (sentimentScore < -0.3) return 'نظرات عمدتاً منفی';
        return 'نظرات متعادل';
    };

    const getSentimentColor = () => {
        if (sentimentScore > 0.3) return 'text-green-600';
        if (sentimentScore < -0.3) return 'text-red-600';
        return 'text-gray-600';
    };

    // Count sentiment tags
    const sentimentCounts = reviews.reduce((acc, review) => {
        acc[review.sentiment_tag || 'neutral'] = (acc[review.sentiment_tag || 'neutral'] || 0) + 1;
        return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    return (
        <Card className="border-blue-200">
            <CardHeader>
                <CardTitle className="text-xl text-blue-900">تحلیل احساسات نظرات</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall Sentiment */}
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                        <div className="flex justify-center mb-4">
                            {getSentimentIcon()}
                        </div>
                        <div className={`text-2xl font-bold mb-2 ${getSentimentColor()}`}>
                            {getSentimentText()}
                        </div>
                        <div className="text-sm text-gray-600">
                            امتیاز احساسی: {sentimentScore.toFixed(2)}
                        </div>
                    </div>

                    {/* Sentiment Breakdown */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ThumbsUp className="w-5 h-5 text-green-600" />
                                <span className="text-gray-700">مثبت</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                                {sentimentCounts.positive} نظر
                            </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Minus className="w-5 h-5 text-gray-600" />
                                <span className="text-gray-700">خنثی</span>
                            </div>
                            <Badge className="bg-gray-100 text-gray-800">
                                {sentimentCounts.neutral} نظر
                            </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ThumbsDown className="w-5 h-5 text-red-600" />
                                <span className="text-gray-700">منفی</span>
                            </div>
                            <Badge className="bg-red-100 text-red-800">
                                {sentimentCounts.negative} نظر
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}