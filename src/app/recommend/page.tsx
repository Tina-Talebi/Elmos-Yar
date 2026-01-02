// src/app/recommender/page.tsx
'use client';

import { useState } from 'react';
import { useReviews, type Review } from '@/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Recommender() {
  const { reviews, loading: dataLoading } = useReviews();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    department: 'all',
    priority_easy_grading: 3,
    priority_teaching: 3,
    priority_interaction: 3,
    priority_free_attendance: 3,
    priority_light_exam: 3,
  });

  const professors = useMemo(() => {
    if (dataLoading) return [];
    const map = new Map<number, any>();
    reviews.forEach((r: Review) => {
      const id = r.professor_id;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name_standard: r.professor_name_standard,
          department: r.department,
          review_count: 0,
          ratings: [0, 0, 0, 0, 0, 0],
          gradingCounts: { آسان: 0, منصفانه: 0, 'سخت‌گیر': 0 },
          totalSentiment: 0,
          attendance_required: r.attendance_encoded === 'حضور مهم است و تاثیر مستقیم دارد' || r.attendance_encoded === 'حضور مهم است',
          exam_sufficient: r.exam_encoded === 1.0,
        });
      }
      const p = map.get(id);
      p.review_count++;
      p.ratings[0] += r.rating_1;
      p.ratings[1] += r.rating_2;
      p.ratings[2] += r.rating_3;
      p.ratings[3] += r.rating_4;
      p.ratings[4] += r.rating_5;
      p.ratings[5] += r.rating_6;
      p.gradingCounts[r.grading_encoded]++;
      p.totalSentiment += r.sentiment_score;
    });

    return Array.from(map.values()).map(p => ({
      ...p,
      avg_rating_1: p.ratings[0] / p.review_count,
      avg_rating_2: p.ratings[1] / p.review_count,
      avg_rating_3: p.ratings[2] / p.review_count,
      avg_rating_4: p.ratings[3] / p.review_count,
      avg_rating_5: p.ratings[4] / p.review_count,
      avg_rating_6: p.ratings[5] / p.review_count,
      grading_easy_pct: Math.round((p.gradingCounts['آسان'] / p.review_count) * 100),
      grading_fair_pct: Math.round((p.gradingCounts['منصفانه'] / p.review_count) * 100),
      grading_hard_pct: Math.round((p.gradingCounts['سخت‌گیر'] / p.review_count) * 100),
      avg_sentiment: p.totalSentiment / p.review_count,
    }));
  }, [reviews, dataLoading]);

  const calculateRecommendations = () => {
    setLoading(true);
    setTimeout(() => {
      let candidates = professors;
      if (preferences.department !== 'all') {
        candidates = candidates.filter(p => p.department === preferences.department);
      }
      candidates = candidates.filter(p => p.review_count >= 3);

      const scored = candidates.map(prof => {
        let score = 0;
        let explanations = [];

        // نمره‌دهی آسان
        const easyScore = (prof.grading_easy_pct / 100);
        score += easyScore * preferences.priority_easy_grading * 2;
        if (preferences.priority_easy_grading >= 4 && easyScore >= 0.5) {
          explanations.push(`نمره‌دهی آسان (${prof.grading_easy_pct}%)`);
        }

        // کیفیت تدریس
        const teachingScore = (prof.avg_rating_1 + prof.avg_rating_3) / 20;
        score += teachingScore * preferences.priority_teaching * 2;
        if (preferences.priority_teaching >= 4 && prof.avg_rating_1 >= 7) {
          explanations.push(`کیفیت تدریس عالی (${prof.avg_rating_1.toFixed(1)})`);
        }

        // تعامل
        const interactionScore = (prof.avg_rating_4 + prof.avg_rating_5) / 20;
        score += interactionScore * preferences.priority_interaction * 2;
        if (preferences.priority_interaction >= 4 && prof.avg_rating_4 >= 7) {
          explanations.push(`تعامل خوب (${prof.avg_rating_4.toFixed(1)})`);
        }

        // حضور آزاد
        const attendanceScore = prof.attendance_required ? 0 : 1;
        score += attendanceScore * preferences.priority_free_attendance;
        if (preferences.priority_free_attendance >= 4 && !prof.attendance_required) {
          explanations.push('حضور و غیاب آزاد');
        }

        // امتحان سبک
        const examScore = prof.exam_sufficient ? 1 : 0;
        score += examScore * preferences.priority_light_exam;
        if (preferences.priority_light_exam >= 4 && prof.exam_sufficient) {
          explanations.push('امتحان کافی برای نمره');
        }

        // احساسات
        const sentimentBonus = (prof.avg_sentiment + 1);
        score += sentimentBonus * 0.5;
        if (prof.avg_sentiment > 0.3) {
          explanations.push('نظرات بسیار مثبت');
        }

        // تعداد نظرات
        const reviewBonus = Math.min(p.review_count / 20, 1);
        score += reviewBonus;

        // امتیاز کلی
        const overall = (prof.avg_rating_1 + prof.avg_rating_2 + prof.avg_rating_3 + prof.avg_rating_4 + prof.avg_rating_5 + prof.avg_rating_6) / 6;
        score += (overall / 10) * 3;

        const explanation = explanations.length > 0 
          ? `همخوانی با اولویت‌ها: ${explanations.join('، ')}`
          : `میانگین امتیاز کلی: ${overall.toFixed(1)}`;

        return { ...prof, score, explanation };
      });

      const top = scored.sort((a, b) => b.score - a.score).slice(0, 10);
      setRecommendations(top);
      setLoading(false);
    }, 800);
  };

  if (dataLoading) {
    return <div className="p-12 text-center">در حال بارگذاری داده‌ها...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">سیستم پیشنهاددهنده هوشمند</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">استاد مناسب شما را بیابید</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            با وارد کردن ترجیحات خود، بهترین اساتید بر اساس نظرات واقعی دانشجویان به شما پیشنهاد می‌شوند
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* فرم اولویت‌ها */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>ترجیحات شما</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">دانشکده</label>
                  <Select value={preferences.department} onValueChange={(v) => setPreferences({...preferences, department: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="همه دانشکده‌ها" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه دانشکده‌ها</SelectItem>
                      {/* دانشکده‌ها رو از داده استخراج می‌کنیم */}
                      {Array.from(new Set(professors.map(p => p.department))).map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">نمره‌دهی آسان (1-5)</label>
                  <Slider
                    value={[preferences.priority_easy_grading]}
                    onValueChange={(v) => setPreferences({...preferences, priority_easy_grading: v[0]})}
                    max={5}
                    step={1}
                  />
                  <p className="text-sm text-right mt-1">{preferences.priority_easy_grading}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">کیفیت تدریس (1-5)</label>
                  <Slider
                    value={[preferences.priority_teaching]}
                    onValueChange={(v) => setPreferences({...preferences, priority_teaching: v[0]})}
                    max={5}
                    step={1}
                  />
                  <p className="text-sm text-right mt-1">{preferences.priority_teaching}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">تعامل با دانشجو (1-5)</label>
                  <Slider
                    value={[preferences.priority_interaction]}
                    onValueChange={(v) => setPreferences({...preferences, priority_interaction: v[0]})}
                    max={5}
                    step={1}
                  />
                  <p className="text-sm text-right mt-1">{preferences.priority_interaction}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">حضور و غیاب آزاد (1-5)</label>
                  <Slider
                    value={[preferences.priority_free_attendance]}
                    onValueChange={(v) => setPreferences({...preferences, priority_free_attendance: v[0]})}
                    max={5}
                    step={1}
                  />
                  <p className="text-sm text-right mt-1">{preferences.priority_free_attendance}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">امتحان سبک (1-5)</label>
                  <Slider
                    value={[preferences.priority_light_exam]}
                    onValueChange={(v) => setPreferences({...preferences, priority_light_exam: v[0]})}
                    max={5}
                    step={1}
                  />
                  <p className="text-sm text-right mt-1">{preferences.priority_light_exam}</p>
                </div>

                <Button onClick={calculateRecommendations} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دریافت پیشنهادات'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* نتایج */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <Loader2 className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-500">در حال محاسبه بهترین پیشنهادات...</p>
                </CardContent>
              </Card>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">
                  پیشنهادات ویژه شما ({recommendations.length} استاد)
                </h2>
                {recommendations.map((prof, idx) => (
                  <Card key={prof.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{prof.name_standard}</h3>
                            <p className="text-sm text-slate-500">{prof.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-600">{prof.avgRatingOverall.toFixed(1)}</p>
                          <p className="text-sm text-slate-500">{prof.review_count} نظر</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        {prof.explanation}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Link href={`/professor/${prof.id}`}>
                          <Button variant="outline">
                            مشاهده پروفایل
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-20 text-center">
                  <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">آماده دریافت پیشنهاد هستید؟</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    اولویت‌های خود را از فرم سمت چپ مشخص کنید و دکمه «دریافت پیشنهادات» را بزنید
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}