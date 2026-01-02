// src/app/professor/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useReviews, type Review } from '@/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Building2, BookOpen, Star, MessageSquare, 
  TrendingUp, TrendingDown, Clock, FileCheck,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import RatingRadar from '@/components/professor/RatingRadarChart'; // بعداً می‌سازیم
import GradingDonut from '@/components/shared/GradingDonut'; // بعداً می‌سازیم
import WordCloud from '@/components/shared/WordCloud'; // بعداً می‌سازیم
import ReviewCard from '@/components/professor/ReviewList'; // بعداً می‌سازیم
import SentimentBadge from '@/components/shared/SentimentBadge'; // بعداً می‌سازیم

const RATING_LABELS = {
  1: 'کیفیت تدریس',
  2: 'مدیریت کلاس',
  3: 'تسلط علمی',
  4: 'تعامل با دانشجو',
  5: 'پاسخگویی',
  6: 'امتیاز کلی'
};

export default function ProfessorProfile() {
  const { id } = useParams();
  const professorId = parseInt(id as string);
  const { reviews, loading } = useReviews();

  const professorData = useMemo(() => {
    if (loading || !reviews.length) return null;
    const profReviews = reviews.filter(r => r.professor_id === professorId);
    if (profReviews.length === 0) return null;

    const first = profReviews[0];
    const avgRatings = [0, 0, 0, 0, 0, 0];
    let totalSentiment = 0;
    const gradingCounts = { آسان: 0, منصفانه: 0, 'سخت‌گیر': 0 };
    const courses = new Set<string>();

    profReviews.forEach(r => {
      avgRatings[0] += r.rating_1;
      avgRatings[1] += r.rating_2;
      avgRatings[2] += r.rating_3;
      avgRatings[3] += r.rating_4;
      avgRatings[4] += r.rating_5;
      avgRatings[5] += r.rating_6;
      totalSentiment += r.sentiment_score;
      gradingCounts[r.grading_encoded]++;
      if (r.course_name) courses.add(r.course_name);
    });

    const count = profReviews.length;
    const avgRatingOverall = avgRatings.reduce((a, b) => a + b, 0) / (count * 6);
    const avgSentiment = totalSentiment / count;

    return {
      id: professorId,
      name_standard: first.professor_name_standard,
      department: first.department,
      review_count: count,
      avg_rating_1: avgRatings[0] / count,
      avg_rating_2: avgRatings[1] / count,
      avg_rating_3: avgRatings[2] / count,
      avg_rating_4: avgRatings[3] / count,
      avg_rating_5: avgRatings[4] / count,
      avg_rating_6: avgRatings[5] / count,
      avgRatingOverall,
      avg_sentiment: avgSentiment,
      sentiment_tag: avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral',
      courses: Array.from(courses),
      reviews: profReviews,
      grading_easy_pct: Math.round((gradingCounts['آسان'] / count) * 100),
      grading_fair_pct: Math.round((gradingCounts['منصفانه'] / count) * 100),
      grading_hard_pct: Math.round((gradingCounts['سخت‌گیر'] / count) * 100),
    };
  }, [reviews, loading, professorId]);

  const comments = useMemo(() => {
    return professorData?.reviews.map(r => r.comments).filter(Boolean) || [];
  }, [professorData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-2xl">در حال بارگذاری پروفایل استاد...</p>
        </div>
      </div>
    );
  }

  if (!professorData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-16 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">استادی یافت نشد</h3>
            <Link href="/search">
              <Button>
                بازگشت به جستجو
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Link href="/search">
            <Button variant="ghost" className="text-white/70 hover:text-white mb-6">
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white/10 flex items-center justify-center">
              <User className="w-16 h-16 text-white/80" />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{professorData.name_standard}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-white/10 border-white/20">
                  <Building2 className="w-4 h-4 ml-1" />
                  {professorData.department.replace(/_/g, ' ')}
                </Badge>
                <Badge className="bg-white/10 border-white/20">
                  <MessageSquare className="w-4 h-4 ml-1" />
                  {professorData.review_count} نظر
                </Badge>
                <SentimentBadge tag={professorData.sentiment_tag} score={professorData.avg_sentiment} showScore />
              </div>

              <div className="flex flex-wrap gap-2">
                {professorData.courses.slice(0, 6).map((course, i) => (
                  <Badge key={i} variant="outline" className="bg-white/5 border-white/20">
                    <BookOpen className="w-3 h-3 ml-1" />
                    {course}
                  </Badge>
                ))}
                {professorData.courses.length > 6 && (
                  <Badge variant="outline" className="bg-white/5 border-white/20">
                    +{professorData.courses.length - 6} درس دیگر
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-white">{professorData.avgRatingOverall.toFixed(1)}</span>
              </div>
              <div className="flex justify-center gap-0.5 mt-2">
                {[1,2,3,4,5].map(i => (
                  <Star 
                    key={i}
                    className={`w-5 h-5 ${i <= Math.round(professorData.avgRatingOverall / 2) ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Cards */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">{RATING_LABELS[i]}</p>
                <p className="text-2xl font-bold">
                  {professorData[`avg_rating_${i}`].toFixed(1)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="reviews">نظرات ({professorData.review_count})</TabsTrigger>
            <TabsTrigger value="analysis">تحلیل متن</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>نمودار امتیازات</CardTitle>
                </CardHeader>
                <CardContent>
                  <RatingRadar professor={professorData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزیع نمره‌دهی</CardTitle>
                </CardHeader>
                <CardContent>
                  <GradingDonut 
                    easyPct={professorData.grading_easy_pct}
                    fairPct={professorData.grading_fair_pct}
                    hardPct={professorData.grading_hard_pct}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4">
              {professorData.reviews.map((review, i) => (
                <ReviewCard key={i} review={review} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>ابر کلمات نظرات</CardTitle>
              </CardHeader>
              <CardContent>
                <WordCloud comments={comments} maxWords={50} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}