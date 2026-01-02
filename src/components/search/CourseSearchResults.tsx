import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function CourseSearchResults({ courses, reviews }) {
    // Group reviews by course
    const courseData = courses.map(course => {
        const courseReviews = reviews.filter(r => r.course_name === course.course_name);
        const avgRating = courseReviews.reduce((sum, r) => sum + (r.rating_6 || 0), 0) / courseReviews.length || 0;
        const professors = [...new Set(courseReviews.map(r => r.professor_name))];
        
        return {
            ...course,
            reviewCount: courseReviews.length,
            avgRating,
            professors
        };
    });

    if (courseData.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-12">
                    <p className="text-gray-500 text-lg">
                        درسی با این مشخصات یافت نشد
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseData.map((course, idx) => (
                <Card key={idx} className="border-blue-200 hover:shadow-lg transition-all">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <CardTitle className="text-lg text-blue-900 mb-2 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    {course.course_name}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                    {course.department?.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-current text-amber-500" />
                                    <span className="font-bold text-lg text-blue-900">
                                        {course.avgRating.toFixed(1)}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {course.reviewCount} نظر
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    اساتید تدریس‌کننده:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {course.professors.map((prof, pidx) => (
                                        <Link
                                            key={pidx}
                                            to={createPageUrl(`ProfessorProfile?id=${course.professor_id}`)}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-blue-100 transition-colors"
                                            >
                                                {prof}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {course.comments && (
                                <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg line-clamp-3">
                                    {course.comments}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}