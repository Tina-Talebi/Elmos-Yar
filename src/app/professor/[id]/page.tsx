'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Building2, BookOpen, Star, MessageSquare, 
  ArrowRight, TrendingUp, Clock, FileCheck, Minus, TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TextAnalysis from '@/components/shared/TextAnalysis';
// --- رابط کاربری داده‌ها ---
interface ReviewData {
  professor_id: number;
  professor_name_standard: string;
  department: string;
  course_name: string;
  term: string;
  comment_text: string; // نام ستون متن نظر در دیتاست شما
  grading: string;
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
  rating_6: number;
  final_sentiment: string;
  confidence: number;
  attendance: string;
  exam_sufficient: string;
  grade: string;
  [key: string]: any;
}

function GradingDonut({ easy, fair, hard }: { easy: number, fair: number, hard: number }) {
  const hasData = easy > 0 || fair > 0 || hard > 0;
  const data = hasData ? [
    { name: 'آسان', value: easy, color: '#10b981' }, 
    { name: 'منصفانه', value: fair, color: '#f59e0b' },
    { name: 'سخت‌گیر', value: hard, color: '#ef4444' },
  ].filter(d => d.value > 0) : [{ name: 'نامشخص', value: 100, color: '#94a3b8' }];
  
  return (
    <div className="w-full h-[250px] flex flex-col items-center justify-center" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={6}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {hasData && (
        <div className="flex gap-4 mt-4" dir="rtl">
          {data.map(d => (
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
    const avgRatings = [0, 0, 0, 0, 0, 0];
    let totalSentiment = 0;
    const gradingCounts = { easy: 0, fair: 0, hard: 0 };
    const attendanceMap: Record<string, number> = {};
    const examMap: Record<string, number> = {};
    const uniqueCourses = new Set<string>();

    profReviews.forEach(r => {
      avgRatings[0] += Number(r.rating_1) || 0;
      avgRatings[1] += Number(r.rating_2) || 0;
      avgRatings[2] += Number(r.rating_3) || 0;
      avgRatings[3] += Number(r.rating_4) || 0;
      avgRatings[4] += Number(r.rating_5) || 0;
      avgRatings[5] += Number(r.rating_6) || 0;
      
      const sentimentScore = r.final_sentiment === 'positive' ? 1 : (r.final_sentiment === 'negative' ? -1 : 0);
      totalSentiment += (Number(r.confidence) || 0) * sentimentScore;
      
      const g = (r.grading || "").toString();
      if (g.includes("آسان") || g.includes("دست باز")) gradingCounts.easy++;
      else if (g.includes("سخت")) gradingCounts.hard++;
      else gradingCounts.fair++;

      const att = r.attendance || "نامشخص";
      attendanceMap[att] = (attendanceMap[att] || 0) + 1;
      const exm = r.exam_sufficient || "نامشخص";
      examMap[exm] = (examMap[exm] || 0) + 1;
      if (r.course_name) uniqueCourses.add(r.course_name);
    });

    const count = profReviews.length;
    const topAttendance = Object.keys(attendanceMap).reduce((a, b) => attendanceMap[a] > attendanceMap[b] ? a : b, "نامشخص");
    const topExam = Object.keys(examMap).reduce((a, b) => examMap[a] > examMap[b] ? a : b, "نامشخص");
    
    return {
      name: first.professor_name_standard,
      department: first.department,
      attendance: topAttendance,
      exam_sufficient: topExam,
      course_count: uniqueCourses.size,
      review_count: count,
      rawReviews: profReviews,
      ratings: avgRatings.map(v => v / count),
      avgSentiment: totalSentiment / count,
      grading: {
        easy: Math.round((gradingCounts.easy / count) * 100),
        fair: Math.round((gradingCounts.fair / count) * 100),
        hard: Math.round((gradingCounts.hard / count) * 100),
      }
    };
  }, [reviews, loading, professorId]);

  if (loading || !professorData) return <div className="p-20 text-center font-bold">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans" dir="rtl">
      {/* Header Section */}
      <div className="bg-[#0f172a] text-white pt-12 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="flex items-center text-slate-400 hover:text-white mb-8 transition-all font-bold text-sm">
            <ArrowRight size={18} className="ml-2" /> بازگشت به خانه
          </Link>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="bg-[#facc15] text-[#0f172a] p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center min-w-[150px]">
                <span className="text-7xl font-black">{professorData.ratings[5].toFixed(1)}</span>
                <div className="flex gap-1 mt-2">
                   {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-current" />)}
                </div>
              </div>
              <div className="text-center md:text-right">
                <h1 className="text-5xl font-black mb-4 tracking-tight">{professorData.name}</h1>
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
          <TabsList className="bg-slate-200/50 p-1 rounded-2xl mb-8">
            <TabsTrigger value="stats" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-white">آمار و تحلیل</TabsTrigger>
            <TabsTrigger value="comments" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-white">نظرات دانشجویان</TabsTrigger>
            <TabsTrigger value="analysis" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-white">تحلیل هوشمند متن</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
                <CardTitle className="text-xl font-black mb-6">ابعاد تدریس</CardTitle>
                <div className="w-full h-[250px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { subject: 'تدریس', A: professorData.ratings[0] },
                      { subject: 'مدیریت', A: professorData.ratings[1] },
                      { subject: 'تسلط', A: professorData.ratings[2] },
                      { subject: 'تعامل', A: professorData.ratings[3] },
                      { subject: 'پاسخگویی', A: professorData.ratings[4] },
                      { subject: 'کلی', A: professorData.ratings[5] },
                    ]}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }} />
                      <Radar name="امتیاز" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
                <CardTitle className="text-xl font-black mb-6">شیوه نمره‌دهی</CardTitle>
                <GradingDonut easy={professorData.grading.easy} fair={professorData.grading.fair} hard={professorData.grading.hard} />
              </Card>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-bold">
              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center justify-between">
                  <div><p className="text-xs text-slate-400 mb-1">احساسات</p><p className="text-2xl font-black">{Math.max(0, Math.round(professorData.avgSentiment * 100))}%</p></div>
                  <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl"><TrendingUp size={24}/></div>
              </Card>
              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center justify-between">
                  <div><p className="text-xs text-slate-400 mb-1">حضور و غیاب</p><p className="text-xl font-black">{professorData.attendance.includes("اختیاری") ? "اختیاری" : "اجباری"}</p></div>
                  <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl"><Clock size={24}/></div>
              </Card>
              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center justify-between">
                  <div><p className="text-xs text-slate-400 mb-1">کفایت امتحان</p><p className="text-xl font-black">{professorData.exam_sufficient.includes("بله") ? "کافی" : "ناکافی"}</p></div>
                  <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><FileCheck size={24}/></div>
              </Card>
              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center justify-between">
                  <div><p className="text-xs text-slate-400 mb-1">دروس ارائه شده</p><p className="text-2xl font-black">{professorData.course_count}</p></div>
                  <div className="p-4 bg-purple-50 text-purple-500 rounded-2xl"><BookOpen size={24}/></div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="grid gap-6">
              {professorData.rawReviews.map((review, index) => (
                <Card key={index} className="border-none shadow-sm rounded-[2rem] bg-white p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400"><User size={24} /></div>
                      <div>
                        <h4 className="font-black text-slate-800">{review.course_name}</h4>
                        <p className="text-xs text-slate-400">{review.term}</p>
                      </div>
                    </div>
                    <Badge className={`rounded-xl px-3 py-1 ${review.final_sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {review.final_sentiment === 'positive' ? <TrendingUp size={14} className="ml-1"/> : <TrendingDown size={14} className="ml-1"/>}
                      {review.final_sentiment === 'positive' ? 'مثبت' : 'منفی'}
                    </Badge>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-lg mb-6 italic">"{review.comments || "نظری ثبت نشده است."}"</p>
                  <div className="flex gap-6 pt-6 border-t border-slate-50 text-sm font-bold text-slate-500">
                    <span>نمره: {review.grade || "نامشخص"}</span>
                    <span>نمره دهی: {review.grading}</span>
                    <span className="flex items-center text-amber-500"><Star size={14} className="ml-1 fill-current"/> {review.rating_6}</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="analysis">
          {professorData?.rawReviews ? (
    <TextAnalysis reviews={professorData.rawReviews} />
  ) : (
    <div className="p-10 text-center font-bold">در حال تحلیل داده‌ها...</div>
  )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}