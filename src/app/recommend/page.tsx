'use client';

import React, { useState, useMemo } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Star, BookOpen, Search, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function RecommenderPage() {
  const { reviews, loading } = useReviews();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);

  const [filters, setFilters] = useState({
    easyGrading: 3,
    teachingQuality: 3,
    interaction: 3,
  });

  // ۱. استخراج و فیلتر کردن لیست دروس
  const allCourses = useMemo(() => {
    if (!reviews) return [];
    const courses = new Set<string>();
    reviews.forEach((r: any) => {
      if (r.course_name) courses.add(r.course_name);
    });
    return Array.from(courses).sort();
  }, [reviews]);

  const filteredCourses = useMemo(() => {
    return allCourses.filter(c => 
      c.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCourses, searchTerm]);

  // ۲. رتبه‌بندی اساتید بر اساس درس و جلوگیری از NaN
  const recommendedResults = useMemo(() => {
    if (!reviews || !selectedCourse) return [];

    const courseReviews = reviews.filter((r: any) => r.course_name === selectedCourse);
    const profMap = new Map();

    courseReviews.forEach((r: any) => {
      const profId = String(r.professor_id);
      if (!profMap.has(profId)) {
        profMap.set(profId, {
          id: profId,
          name: r.professor_name_standard,
          dept: r.department?.replace(/_/g, ' ') || "نامشخص",
          ratings: [],
          count: 0,
        });
      }
      const prof = profMap.get(profId);
      prof.ratings.push(r);
      prof.count++;
    });

    return Array.from(profMap.values()).map(prof => {
      // محاسبه امن میانگین برای جلوگیری از NaN (امتیاز کل معمولاً rating_6 است)
      const validRatings = prof.ratings
        .map((r: any) => parseFloat(r.rating_6))
        .filter((val: number) => !isNaN(val));

      const totalAvg = validRatings.length > 0 
        ? validRatings.reduce((a: number, b: number) => a + b, 0) / validRatings.length 
        : 0;

      return { ...prof, totalAvg };
    }).sort((a, b) => b.totalAvg - a.totalAvg); 

  }, [reviews, selectedCourse]);

  if (loading) return <div className="p-20 text-center font-bold">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">پیشنهاد هوشمند استاد</h1>
            <p className="text-slate-500 font-medium">درس مورد نظر را جستجو کنید تا بهترین اساتید را بر اساس تجربه دانشجویان ببینید.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* سایدبار با لیست دروس اصلاح شده */}
          <Card className="lg:col-span-4 border-none shadow-2xl rounded-[2.5rem] bg-white sticky top-8 h-fit">
            <CardContent className="p-8">
              <div className="mb-10">
                <label className="flex items-center gap-2 font-black text-slate-700 mb-4">
                  <BookOpen size={20} className="text-blue-600"/> انتخاب درس:
                </label>
                
                {/* باکس جستجو و Dropdown */}
                <div className="relative">
                  <div 
                    className="flex items-center justify-between w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 cursor-pointer"
                    onClick={() => setIsListOpen(!isListOpen)}
                  >
                    <span className="font-bold text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap">
                      {selectedCourse || "جستجوی درس..."}
                    </span>
                    <ChevronDown size={18} className={`transition-transform ${isListOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isListOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search size={14} className="absolute right-3 top-3 text-slate-400" />
                          <input 
                            className="w-full bg-slate-50 rounded-xl py-2 pr-9 pl-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="نام درس..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map(course => (
                            <div 
                              key={course}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer font-bold text-sm text-slate-600 transition-colors"
                              onClick={() => {
                                setSelectedCourse(course);
                                setIsListOpen(false);
                                setSearchTerm("");
                              }}
                            >
                              {course}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">درسی یافت نشد</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8 border-t pt-8">
                <PreferenceSlider label="نمره‌دهی آسان" value={filters.easyGrading} onChange={(v) => setFilters({...filters, easyGrading: v})} />
                <PreferenceSlider label="کیفیت تدریس" value={filters.teachingQuality} onChange={(v) => setFilters({...filters, teachingQuality: v})} />
              </div>
            </CardContent>
          </Card>

          {/* نمایش نتایج */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedCourse ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                    <Search size={64} className="mx-auto text-slate-200 mb-6" />
                    <p className="font-black text-slate-400 text-xl">یک درس انتخاب کنید.</p>
                </div>
            ) : recommendedResults.length === 0 ? (
                <div className="p-20 text-center font-bold text-slate-400">داده‌ای یافت نشد.</div>
            ) : (
                recommendedResults.map((prof, index) => (
                    <Card key={prof.id} className="border-none shadow-sm rounded-[2.5rem] bg-white transition-all hover:shadow-xl group border-r-8 border-transparent hover:border-blue-600">
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                    <User size={32} />
                                </div>
                                <div className="text-right">
                                    <h4 className="text-2xl font-black text-slate-800 mb-1">{prof.name}</h4>
                                    <p className="text-sm text-slate-400 font-bold mb-3">{prof.dept}</p>
                                    <Badge className="bg-blue-50 text-blue-600 border-none rounded-lg text-[10px] font-black">{prof.count} نظر</Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100">
                                    <div className="flex items-center justify-center gap-1 text-amber-600">
                                        <span className="text-3xl font-black">{prof.totalAvg.toFixed(1)}</span>
                                        <Star size={20} className="fill-current" />
                                    </div>
                                    <p className="text-[10px] text-amber-500 font-black mt-1 uppercase">امتیاز درس</p>
                                </div>
                                <Link href={`/professor/${prof.id}`}>
                                    <Button variant="outline" className="rounded-2xl border-2 border-slate-100 hover:bg-slate-900 hover:text-white font-black h-12 px-6">مشاهده</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
          </div>
        </div>
      </div>
      
      {/* استایل داخلی برای اسکرول */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

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