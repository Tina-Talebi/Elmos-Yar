// src/app/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useReviews, type Review } from '@/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, Users, MessageSquare, Star,
  Sparkles, Building2, BookOpen, Search
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { reviews, loading } = useReviews();

  // آمار کلی
  const stats = useMemo(() => {
    if (loading || reviews.length === 0) return { professors: 0, departments: 0, courses: 0, reviews: 0 };
    const uniqueProfs = new Set(reviews.map(r => r.professor_name_standard));
    const uniqueDepts = new Set(reviews.map(r => r.department));
    const uniqueCourses = new Set(reviews.map(r => r.course_name));
    return {
      professors: uniqueProfs.size,
      departments: uniqueDepts.size,
      courses: uniqueCourses.size,
      reviews: reviews.length,
    };
  }, [reviews, loading]);

  // برترین اساتید (با حداقل ۳ نظر و میانگین بالاترین)
  const topProfessors = useMemo(() => {
    if (loading) return [];
    const map = new Map<string, any>();
    reviews.forEach((r: Review) => {
      const name = r.professor_name_standard;
      if (!map.has(name)) {
        map.set(name, {
          name,
          department: r.department,
          reviewCount: 0,
          totalRating: 0,
        });
      }
      const prof = map.get(name);
      prof.reviewCount++;
      prof.totalRating += (r.rating_1 + r.rating_2 + r.rating_3 + r.rating_4 + r.rating_5 + r.rating_6) / 6;
    });
    return Array.from(map.values())
      .filter(p => p.reviewCount >= 3)
      .map(p => ({ ...p, avgRating: p.totalRating / p.reviewCount }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  }, [reviews, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMzRoNHY0aC00ek0yMCAyMGg0djRoLTR6TTM2IDIwaDR2NGgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center">
            <Badge className="bg-white/10 text-white border-white/20 mb-6 px-4 py-1.5">
              <Sparkles className="w-4 h-4 ml-2" />
              دانشگاه علم و صنعت ایران
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              علموص‌یار
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              انتخاب هوشمندانه استاد و درس با تحلیل نظرات واقعی دانشجویان
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/search">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-8 text-lg rounded-xl shadow-lg">
                  <Search className="w-5 h-5 ml-2" />
                  جستجوی استاد
                </Button>
              </Link>
              <Link href="/recommender">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10 h-14 px-8 text-lg">
                  <Sparkles className="w-5 h-5 ml-2" />
                  پیشنهاد هوشمند
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-100">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{stats.professors}</p>
              <p className="text-sm text-blue-700">اساتید</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-100">
            <CardContent className="p-6 text-center">
              <Building2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-900">{stats.departments}</p>
              <p className="text-sm text-emerald-700">دانشکده‌ها</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-100">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{stats.courses}</p>
              <p className="text-sm text-purple-700">درس‌ها</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-100">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-900">{stats.reviews}</p>
              <p className="text-sm text-amber-700">نظرات</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Professors */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-500" />
            برترین اساتید
          </h2>
          <Link href="/search">
            <Button variant="ghost">
              مشاهده همه
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <p className="text-center">در حال بارگذاری...</p>
          ) : topProfessors.length === 0 ? (
            <p className="text-center text-slate-500">استادی با حداقل ۳ نظر یافت نشد</p>
          ) : (
            topProfessors.map((prof, i) => (
              <Card key={i} className="hover:shadow-lg transition">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-600">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{prof.name}</h3>
                      <p className="text-sm text-slate-500">{prof.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-600">{prof.avgRating.toFixed(1)}</p>
                    <p className="text-sm text-slate-500">{prof.reviewCount} نظر</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/compare">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all group">
              <CardContent className="p-8 text-white text-center">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">مقایسه اساتید</h3>
                <p className="text-blue-100">اساتید مختلف را کنار هم مقایسه کنید</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/recommender">
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all group">
              <CardContent className="p-8 text-white text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">پیشنهاد هوشمند</h3>
                <p className="text-amber-100">استاد مناسب با سلیقه شما را بیابید</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/search">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all group">
              <CardContent className="p-8 text-white text-center">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">جستجوی پیشرفته</h3>
                <p className="text-emerald-100">با فیلترهای متنوع جستجو کنید</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}