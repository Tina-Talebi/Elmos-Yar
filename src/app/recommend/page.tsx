'use client';

import React, { useState, useMemo } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Star, BookOpen, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function RecommenderPage() {
  const { reviews, loading } = useReviews();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [filters, setFilters] = useState({
    easyGrading: 3,
    teachingQuality: 3,
    interaction: 3,
  });

  // ۱. استخراج لیست تمام دروس منحصر به فرد برای منوی انتخاب
  const allCourses = useMemo(() => {
    if (!reviews) return [];
    const courses = new Set<string>();
    reviews.forEach((r: any) => {
      if (r.course_name) courses.add(r.course_name);
    });
    return Array.from(courses).sort();
  }, [reviews]);

  // ۲. فیلتر کردن و رتبه‌بندی اساتید بر اساس درس انتخاب شده و اولویت‌ها
  // ۲. فیلتر کردن و رتبه‌بندی اساتید بر اساس درس انتخاب شده
const recommendedResults = useMemo(() => {
  if (!reviews || !selectedCourse) return [];

  const courseReviews = reviews.filter((r: any) => r.course_name === selectedCourse);

  const profMap = new Map();
  courseReviews.forEach((r: any) => {
    if (!profMap.has(r.professor_id)) {
      profMap.set(r.professor_id, {
        id: r.professor_id,
        name: r.professor_name_standard,
        dept: r.department,
        ratings: [],
        count: 0,
      });
    }
    const prof = profMap.get(r.professor_id);
    prof.ratings.push(r);
    prof.count++;
  });

  return Array.from(profMap.values()).map(prof => {
    // محاسبه میانگین امتیاز کلی (ستون rating_6 معمولاً امتیاز کل است)
    const totalAvg = prof.ratings.reduce((acc: any, curr: any) => acc + (Number(curr.rating_6) || 0), 0) / prof.count;
    
    // میانگین شاخص‌های دیگر برای تاثیر دادن اسلایدرها در صورت نیاز
    const gradingAvg = prof.ratings.reduce((acc: any, curr: any) => acc + (Number(curr.rating_1) || 0), 0) / prof.count;

    return { 
      ...prof, 
      totalAvg,
      gradingAvg 
    };
  })
  // مرتب‌سازی بر اساس بالاترین امتیاز کلی (نزولی)
  .sort((a, b) => b.totalAvg - a.totalAvg); 

}, [reviews, selectedCourse, filters]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* هدر */}
        <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">پیشنهاد هوشمند استاد بر اساس درس</h1>
            <p className="text-slate-500 font-medium">ابتدا درس خود را انتخاب کنید تا بهترین اساتید ارائه دهنده آن را بیابیم.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* سایدبار فیلترها */}
          <Card className="lg:col-span-4 border-none shadow-2xl rounded-[2.5rem] bg-white sticky top-8">
            <CardContent className="p-8">
              {/* بخش انتخاب درس */}
              <div className="mb-10">
                <label className="flex items-center gap-2 font-black text-slate-700 mb-4">
                  <BookOpen size={20} className="text-blue-600"/> انتخاب درس:
                </label>
                <select 
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-4 font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">-- یک درس را انتخاب کنید --</option>
                  {allCourses.map(course => <option key={course} value={course}>{course}</option>)}
                </select>
              </div>

              {/* اسلایدرهای اولویت */}
              <div className="space-y-10 border-t pt-8">
                <h3 className="font-black text-slate-800 mb-6">اولویت‌های شما در این درس:</h3>
                <PreferenceSlider label="نمره‌دهی آسان" value={filters.easyGrading} onChange={(v) => setFilters({...filters, easyGrading: v})} />
                <PreferenceSlider label="کیفیت تدریس" value={filters.teachingQuality} onChange={(v) => setFilters({...filters, teachingQuality: v})} />
                <PreferenceSlider label="تعامل با دانشجو" value={filters.interaction} onChange={(v) => setFilters({...filters, interaction: v})} />
              </div>
            </CardContent>
          </Card>

          {/* لیست نتایج */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedCourse ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                    <Search size={64} className="mx-auto text-slate-200 mb-6" />
                    <p className="font-black text-slate-400 text-xl">برای مشاهده پیشنهادات، ابتدا یک درس را انتخاب کنید.</p>
                </div>
            ) : recommendedResults.length === 0 ? (
                <div className="p-20 text-center font-bold text-slate-400">نظری برای این درس ثبت نشده است.</div>
            ) : (
                recommendedResults.map((prof, index) => (
                    <Card key={prof.id} className="border-none shadow-sm rounded-[2.5rem] bg-white transition-all hover:shadow-xl hover:-translate-y-1 group border-r-8 border-transparent hover:border-blue-600">
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-black text-2xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                        <User size={32} />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xs">#{index+1}</div>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-2xl font-black text-slate-800 mb-1">{prof.name}</h4>
                                    <p className="text-sm text-slate-400 font-bold mb-3">{prof.dept}</p>
                                    <Badge className="bg-blue-50 text-blue-600 border-none rounded-lg text-[10px] font-black">{prof.count} نظر در این درس</Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100">
                                    <div className="flex items-center justify-center gap-1 text-amber-600">
                                        <span className="text-3xl font-black">{prof.totalAvg.toFixed(1)}</span>
                                        <Star size={20} className="fill-current" />
                                    </div>
                                    <p className="text-[10px] text-amber-500 font-black tracking-widest uppercase mt-1">امتیاز درس</p>
                                </div>
                                <Link href={`/professor/${prof.id}`}>
                                    <Button variant="outline" className="rounded-2xl border-2 border-slate-100 hover:bg-slate-900 hover:text-white font-black h-12 px-6 transition-all">مشاهده پروفایل</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// کامپوننت اسلایدر کمکی
function PreferenceSlider({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="font-black text-slate-600 text-sm">{label}</span>
                <span className="text-xs font-black text-blue-600">{value}</span>
            </div>
            <Slider defaultValue={[value]} max={5} min={1} step={1} onValueChange={(vals) => onChange(vals[0])} />
        </div>
    );
}