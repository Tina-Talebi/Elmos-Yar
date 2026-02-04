'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Building2, BookOpen, Star, MessageSquare, 
  ArrowRight, TrendingUp, TrendingDown, Clock, FileCheck
} from 'lucide-react';
import Link from 'next/link';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import TextAnalysis from '@/components/shared/TextAnalysis';

interface ReviewData {
  professor_id: number;
  professor_name_standard: string;
  department: string;
  course_name: string;
  term: string;
  comments: string; 
  grading: string;
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
  rating_6: number;
  final_sentiment: string;
  confidence?: number;
  attendance: string;
  exam_sufficient: string;
  grade: string;
  [key: string]: any;
}

function GradingDonut({ easy, fair, hard }: { easy: number; fair: number; hard: number }) {
  const hasData = easy > 0 || fair > 0 || hard > 0;
  const data = hasData
    ? [
        { name: 'آسان', value: easy, color: '#10b981' },
        { name: 'منصفانه', value: fair, color: '#f59e0b' },
        { name: 'سخت‌گیر', value: hard, color: '#ef4444' },
      ].filter((d) => d.value > 0)
    : [{ name: 'نامشخص', value: 100, color: '#94a3b8' }];

  return (
    <div className="w-full h-[250px] flex flex-col items-center justify-center" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            cornerRadius={6}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {hasData && (
        <div className="flex gap-4 mt-4" dir="rtl">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}: {d.value}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfessorProfile() {
  const { id } = useParams();
  const professorId = parseInt(id as string);
  const { reviews, loading } = useReviews();

  const professorData = useMemo(() => {
    if (loading || !reviews || reviews.length === 0) return null;
    const allReviews = reviews as unknown as ReviewData[];
    const profReviews = allReviews.filter(r => Number(r.professor_id) === professorId);
    if (profReviews.length === 0) return null;

    const first = profReviews[0];
    const ratingSum = [0, 0, 0, 0, 0, 0];
    const gradingCounts = { آسان: 0, منصفانه: 0, 'سخت‌گیر': 0 };
    const attendanceMap: Record<string, number> = {};
    const examMap: Record<string, number> = {};
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    const uniqueCourses = new Set<string>();

    profReviews.forEach(r => {
      // Ratings
      for (let i = 1; i <= 6; i++) {
        const val = parseFloat(r[`rating_${i}`] as any);
        ratingSum[i - 1] += isNaN(val) ? 0 : val;
      }

      // Sentiment
      const sentiment = String(r.final_sentiment || "").toLowerCase().trim();
      if (sentiment === 'positive') sentimentCounts.positive++;
      else if (sentiment === 'negative' || sentiment === 'negetive') sentimentCounts.negative++;
      else sentimentCounts.neutral++;

      // Grading
      const gText = String(r.grading || "").toLowerCase().trim();
      if (
        gText.includes("سختگیر") || gText.includes("سخت گیر") || gText.includes("کمتر") || 
        gText.includes("پایین") || gText.includes("افتضاح") || gText.includes("بد") || 
        gText.includes("رندوم") || gText.includes("شانسی") || gText.includes("غیر منطقی") || 
        gText.includes("عجیب") || gText.includes("نمره خوبی نمیشه گرفت")
      ) gradingCounts['سخت‌گیر']++;
      else if (
        gText.includes("دست باز") || gText.includes("ارفاق") || gText.includes("مهربان") ||
        gText.includes("راحت میشه") || gText.includes("نمره راحت") || gText.includes("بالا میده") ||
        gText.includes("نمره بالا")
      ) gradingCounts.آسان++;
      else gradingCounts.منصفانه++;

      // Attendance & Exam
      const att = (r.attendance || "نامشخص").trim();
      attendanceMap[att] = (attendanceMap[att] || 0) + 1;
      const exm = (r.exam_sufficient || "نامشخص").trim();
      examMap[exm] = (examMap[exm] || 0) + 1;

      if (r.course_name) uniqueCourses.add(r.course_name);
    });

    const count = profReviews.length;
    const taughtCourses = Array.from(uniqueCourses).filter(Boolean);

    const getMajority = (map: Record<string, number>) => {
      const entries = Object.entries(map);
      if (!entries.length) return "نامشخص";
      return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    };

    const topAttendance = getMajority(attendanceMap);
    const topExam = getMajority(examMap);

    // Calculate overall score: average of rating_1 to rating_6
    const overallScore = ratingSum.reduce((a, b) => a + b, 0) / (count * 6);

    return {
      name: first.professor_name_standard,
      department: first.department,
      attendance: topAttendance,
      exam_sufficient: topExam,
      course_count: uniqueCourses.size,
      taughtCourses,
      review_count: count,
      rawReviews: profReviews,
      ratings: ratingSum.map(v => v / count),
      positive_sentiment_pct: Math.round((sentimentCounts.positive / count) * 100),
      grading: {
        easy: Math.round((gradingCounts.آسان / count) * 100),
        fair: Math.round((gradingCounts.منصفانه / count) * 100),
        hard: Math.round((gradingCounts['سخت‌گیر'] / count) * 100),
      },
      overallScore
    };
  }, [reviews, loading, professorId]);

  if (loading || !professorData) {
    return (
      <div className="p-20 text-center font-black text-slate-400 animate-pulse">
        در حال تحلیل داده‌های استاد...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-right" dir="rtl">
      {/* Header */}
      <div className="bg-[#0f172a] text-white pt-12 pb-20 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-all font-bold text-sm">
            <ArrowRight size={18} className="ml-2" /> بازگشت به جستجو
          </Link>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="bg-[#facc15] text-[#0f172a] p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center min-w-[150px] transform hover:scale-105 transition-transform">
                <span className="text-7xl font-black">{professorData.overallScore.toFixed(1)}</span>
                <div className="flex gap-1 mt-2 text-[#0f172a]/60">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-current" />)}
                </div>
              </div>
              <div className="text-center md:text-right">
                <h1 className="text-5xl font-black mb-4 tracking-tight">{professorData.name}</h1>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {professorData.taughtCourses.map((course, idx) => (
                    <span key={idx} className="bg-white/10 backdrop-blur-md text-white/90 px-3 py-1 rounded-xl text-[11px] font-black border border-white/20">
                      {course}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Badge className="bg-slate-800 text-slate-300 border-none px-4 py-2 rounded-xl text-xs font-bold">
                    <Building2 size={14} className="ml-2" /> {professorData.department}
                  </Badge>
                  <Badge className="bg-slate-800 text-slate-300 border-none px-4 py-2 rounded-xl text-xs font-bold">
                    <MessageSquare size={14} className="ml-2" /> {professorData.review_count} نظر
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="bg-slate-200/50 p-1 rounded-2xl mb-8 flex w-fit mx-auto md:mx-0">
            <TabsTrigger value="stats" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-white shadow-sm">آمار و تحلیل</TabsTrigger>
            <TabsTrigger value="comments" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-white shadow-sm">نظرات ({professorData.review_count})</TabsTrigger>
            <TabsTrigger value="analysis" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-white shadow-sm">تحلیل متن</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 transform hover:shadow-md transition-all">
                <CardTitle className="text-xl font-black mb-6 text-slate-800">ابعاد تدریس</CardTitle>
                <div className="w-full h-[280px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { subject: 'تدریس', A: professorData.ratings[0] },
                      { subject: 'مدیریت', A: professorData.ratings[1] },
                      { subject: 'تسلط', A: professorData.ratings[2] },
                      { subject: 'تعامل', A: professorData.ratings[3] },
                      { subject: 'پاسخگویی', A: professorData.ratings[4] },
                      { subject: 'امتیاز کل', A: professorData.ratings[5] },
                    ]}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }} />
                      <Radar name="امتیاز" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 transform hover:shadow-md transition-all">
                <CardTitle className="text-xl font-black mb-6 text-slate-800">وضعیت نمره‌دهی</CardTitle>
                <GradingDonut 
                  easy={professorData.grading.easy} 
                  fair={professorData.grading.fair} 
                  hard={professorData.grading.hard} 
                />
              </Card>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-bold">
              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center justify-between hover:scale-105 transition-transform">
                <div>
                  <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-tighter">احساسات مثبت</p>
                  <p className="text-2xl font-black text-emerald-600">{professorData.positive_sentiment_pct}%</p>
                </div>
                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl"><TrendingUp size={24}/></div>
              </Card>

              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center justify-between hover:scale-105 transition-transform">
                <div>
                  <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-tighter">حضور و غیاب</p>
                  <p className="text-lg font-black text-slate-700">{professorData.attendance}</p>
                </div>
                <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl"><Clock size={24}/></div>
              </Card>

              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center justify-between hover:scale-105 transition-transform">
                <div>
                  <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-tighter">کفایت امتحان</p>
                  <p className="text-lg font-black text-slate-700">{professorData.exam_sufficient}</p>
                </div>
                <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><FileCheck size={24}/></div>
              </Card>

              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center justify-between hover:scale-105 transition-transform">
                <div>
                  <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-tighter">تعداد دروس</p>
                  <p className="text-2xl font-black text-slate-700">{professorData.course_count}</p>
                </div>
                <div className="p-4 bg-purple-50 text-purple-500 rounded-2xl"><BookOpen size={24}/></div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="grid gap-6">
              {professorData.rawReviews.map((review, index) => {
                const hasGrade = review.grade && review.grade.trim() !== "" && review.grade.toLowerCase() !== "نامشخص";
                return (
                  <Card key={index} className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                          <User size={28} />
                        </div>
                        <div className="text-right">
                          <h4 className="font-black text-slate-800 text-lg">{review.course_name}</h4>
                          <p className="text-xs text-slate-400 font-bold">{review.term}</p>
                        </div>
                      </div>
                      <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] border-none ${
                        review.final_sentiment?.toLowerCase() === 'positive' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : review.final_sentiment?.toLowerCase() === 'negative' 
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {review.final_sentiment?.toLowerCase() === 'positive' ? <TrendingUp size={14} className="ml-1.5 inline"/> : 
                         review.final_sentiment?.toLowerCase() === 'negative' ? <TrendingDown size={14} className="ml-1.5 inline"/> : 
                         <div className="w-3 h-3 rounded-full bg-slate-400 inline-block ml-1.5" />}
                        {review.final_sentiment?.toLowerCase() === 'positive' ? 'مثبت' : 
                         review.final_sentiment?.toLowerCase() === 'negative' ? 'منفی' : 'خنثی'}
                      </Badge>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg mb-8 italic text-right px-2">
                      "{review.comments || "دانشجو متنی برای این نظر ثبت نکرده است."}"
                    </p>
                    <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-50 text-xs font-black text-slate-400">
                      {hasGrade && (
                        <span className="bg-slate-50 px-3 py-1 rounded-lg">نمره دانشجو: {review.grade}</span>
                      )}
                      <span className="bg-slate-50 px-3 py-1 rounded-lg">نمره‌دهی: {review.grading || "نامشخص"}</span>
                      <span className="flex items-center text-amber-500 bg-amber-50 px-3 py-1 rounded-lg">
                        <Star size={12} className="ml-1 fill-current"/> {Number(review.rating_6 || 0).toFixed(1)}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <TextAnalysis reviews={professorData.rawReviews} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
