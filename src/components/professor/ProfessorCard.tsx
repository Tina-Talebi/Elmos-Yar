import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, MessageSquare, ChevronLeft } from 'lucide-react';

export default function ProfessorCard({ professor }) {
    const getRatingColor = (rating) => {
        if (rating >= 8) return 'text-green-600';
        if (rating >= 6) return 'text-amber-600';
        return 'text-red-600';
    };

    const getGradingBadge = () => {
        const easy = professor.grading_easy_pct || 0;
        const hard = professor.grading_hard_pct || 0;
        const fair = professor.grading_fair_pct || 0;

        if (easy > hard && easy > fair) {
            return <Badge className="bg-green-100 text-green-800 border-green-300">نمره‌دهی آسان</Badge>;
        }
        if (hard > easy && hard > fair) {
            return <Badge className="bg-red-100 text-red-800 border-red-300">سخت‌گیر</Badge>;
        }
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">منصفانه</Badge>;
    };

    const getSentimentBadge = () => {
        const sentiment = professor.avg_sentiment || 0;
        if (sentiment > 0.3) {
            return <Badge className="bg-green-100 text-green-700">نظرات مثبت</Badge>;
        }
        if (sentiment < -0.3) {
            return <Badge className="bg-red-100 text-red-700">نظرات منفی</Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-700">نظرات متعادل</Badge>;
    };

    return (
        <Link to={createPageUrl(`ProfessorProfile?id=${professor.id}`)}>
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-blue-200 hover:border-blue-400 cursor-pointer group">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="text-xl text-blue-900 group-hover:text-blue-600 transition-colors">
                                {professor.name_standard}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                {professor.department?.replace(/_/g, ' ')}
                            </p>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-[-4px] transition-all" />
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Star className={`w-5 h-5 fill-current ${getRatingColor(professor.avg_rating_6 || 0)}`} />
                            <span className={`text-2xl font-bold ${getRatingColor(professor.avg_rating_6 || 0)}`}>
                                {(professor.avg_rating_6 || 0).toFixed(1)}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">از 10</span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {getGradingBadge()}
                        {getSentimentBadge()}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div className="text-center">
                            <div className="text-sm text-gray-500">تدریس</div>
                            <div className="font-bold text-blue-900">
                                {(professor.avg_rating_1 || 0).toFixed(1)}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500">تعامل</div>
                            <div className="font-bold text-blue-900">
                                {(professor.avg_rating_4 || 0).toFixed(1)}
                            </div>
                        </div>
                    </div>

                    {/* Review Count */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-2 border-t">
                        <MessageSquare className="w-4 h-4" />
                        <span>{professor.review_count || 0} نظر</span>
                    </div>

                    {/* Courses */}
                    {professor.courses && professor.courses.length > 0 && (
                        <div className="pt-2 border-t">
                            <div className="text-xs text-gray-500 mb-1">دروس تدریس شده:</div>
                            <div className="text-sm text-gray-700 line-clamp-2">
                                {professor.courses.slice(0, 2).join('، ')}
                                {professor.courses.length > 2 && '...'}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}