'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useReviews, type Review } from '@/hooks/useReviews';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Building2,
  BookOpen,
} from 'lucide-react';

import ProfessorCard from '@/components/shared/ProfessorCard';
import StatCard from '@/components/shared/StatCard';
import SearchFilters from '@/components/shared/SearchFilters';

type Filters = {
  search: string;
  department: string;
  grading: string;
  minRating: number;
  minReviews: number;
  minSentiment: number;
};

export default function Home() {
  const { reviews, loading, error } = useReviews();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    department: 'all',
    grading: 'all',
    minRating: 0,
    minReviews: 0,
    minSentiment: -1,
  });

  // ۱. محاسبه آمار کلی
  const stats = useMemo(() => {
    if (loading || !reviews.length) {
      return { professors: 0, departments: 0, courses: 0, reviews: 0 };
    }
    const profSet = new Set(reviews.map((r) => r.professor_name_standard));
    const deptSet = new Set(reviews.map((r) => r.department));
    const courseSet = new Set(reviews.map((r) => r.course_name));

    return {
      professors: profSet.size,
      departments: deptSet.size,
      courses: courseSet.size,
      reviews: reviews.length,
    };
  }, [reviews, loading]);

  // ۲. تجمیع داده‌ها به سطح استاد
  type ProfAgg = {
    id: string; 
    name_standard: string;
    department: string;
    review_count: number;
    avg_rating_1: number;
    avg_rating_2: number;
    avg_rating_3: number;
    avg_rating_4: number;
    avg_rating_5: number;
    avg_rating_6: number;
    avg_sentiment: number;
    grading_easy_pct: number;
    grading_hard_pct: number;
    grading_fair_pct: number;
    courses: string[];
  };

  const allProfessors: ProfAgg[] = useMemo(() => {
    const map = new Map<string, ProfAgg>();

    reviews.forEach((r: Review) => {
      const key = r.professor_name_standard;
      if (!map.has(key)) {
        map.set(key, {
          id: String(r.professor_id), // استفاده از ID دیتابیس
          name_standard: r.professor_name_standard,
          department: r.department,
          review_count: 0,
          avg_rating_1: 0,
          avg_rating_2: 0,
          avg_rating_3: 0,
          avg_rating_4: 0,
          avg_rating_5: 0,
          avg_rating_6: 0,
          avg_sentiment: 0,
          grading_easy_pct: 0,
          grading_hard_pct: 0,
          grading_fair_pct: 0,
          courses: [],
        });
      }

      const p = map.get(key)!;
      p.review_count += 1;
      p.avg_rating_1 += r.rating_1;
      p.avg_rating_2 += r.rating_2;
      p.avg_rating_3 += r.rating_3;
      p.avg_rating_4 += r.rating_4;
      p.avg_rating_5 += r.rating_5;
      p.avg_rating_6 += r.rating_6;
      p.avg_sentiment += r.sentiment_score;

      if (!p.courses.includes(r.course_name)) p.courses.push(r.course_name);
      if (r.grading_encoded === 'آسان') p.grading_easy_pct += 1;
      if (r.grading_encoded === 'سخت‌گیر') p.grading_hard_pct += 1;
      if (r.grading_encoded === 'منصفانه') p.grading_fair_pct += 1;
    });

    return Array.from(map.values()).map((p) => {
      const n = p.review_count || 1;
      const totalGrading = p.grading_easy_pct + p.grading_hard_pct + p.grading_fair_pct || 1;
      return {
        ...p,
        avg_rating_1: p.avg_rating_1 / n,
        avg_rating_2: p.avg_rating_2 / n,
        avg_rating_3: p.avg_rating_3 / n,
        avg_rating_4: p.avg_rating_4 / n,
        avg_rating_5: p.avg_rating_5 / n,
        avg_rating_6: p.avg_rating_6 / n,
        avg_sentiment: p.avg_sentiment / n,
        grading_easy_pct: (p.grading_easy_pct / totalGrading) * 100,
        grading_hard_pct: (p.grading_hard_pct / totalGrading) * 100,
        grading_fair_pct: (p.grading_fair_pct / totalGrading) * 100,
      };
    });
  }, [reviews]);

  // ۳. فیلتر کردن اساتید
  // ۳. فیلتر کردن و مرتب‌سازی اساتید
const filteredProfessors = useMemo(() => {
  // مرحله اول: فیلتر کردن داده‌ها
  const filtered = allProfessors.filter((prof) => {
    // فیلتر جستجو (نام، دانشکده، درس)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchName = prof.name_standard.toLowerCase().includes(search);
      const matchDept = prof.department?.toLowerCase().includes(search);
      const matchCourse = prof.courses?.some((c) =>
        c.toLowerCase().includes(search)
      );
      if (!matchName && !matchDept && !matchCourse) return false;
    }

    if (filters.department !== 'all' && prof.department !== filters.department) {
      return false;
    }

    // فیلتر حداقل تعداد نظرات
    if (filters.minReviews > 0 && prof.review_count < filters.minReviews) {
      return false;
    }

    // فیلتر نمره‌دهی (آسان، سخت‌گیر، منصفانه)
    if (filters.grading !== 'all') {
      if (filters.grading === 'آسان' && (prof.grading_easy_pct || 0) < 50) return false;
      if (filters.grading === 'سخت‌گیر' && (prof.grading_hard_pct || 0) < 50) return false;
      if (filters.grading === 'منصفانه' && (prof.grading_fair_pct || 0) < 40) return false;
    }

    // فیلتر حداقل امتیاز کل (میانگین هر ۶ معیار)
    const currentAvg = (
      prof.avg_rating_1 + prof.avg_rating_2 + prof.avg_rating_3 + 
      prof.avg_rating_4 + prof.avg_rating_5 + prof.avg_rating_6
    ) / 6;
    if (currentAvg < filters.minRating) return false;

    // فیلتر تحلیل حس (Sentiment)
    if ((prof.avg_sentiment || 0) < filters.minSentiment) return false;

    return true;
  });

  // مرحله دوم: مرتب‌سازی (Sort) بر اساس میانگین کل (نزولی)
  return filtered.sort((a, b) => {
    const avgA = (a.avg_rating_1 + a.avg_rating_2 + a.avg_rating_3 + 
                  a.avg_rating_4 + a.avg_rating_5 + a.avg_rating_6) / 6;
    const avgB = (b.avg_rating_1 + b.avg_rating_2 + b.avg_rating_3 + 
                  b.avg_rating_4 + b.avg_rating_5 + b.avg_rating_6) / 6;
    
    return avgB - avgA; // امتیاز بیشتر در بالا قرار می‌گیرد
  });
}, [allProfessors, filters]);

  // ۴. اساتید برتر
  const topProfessors = useMemo(() => {
    return [...allProfessors]
      .filter((p) => p.review_count >= 3)
      .sort((a, b) => {
        // محاسبه میانگین کل برای استاد اول
        const avgA = (a.avg_rating_1 + a.avg_rating_2 + a.avg_rating_3 + 
                      a.avg_rating_4 + a.avg_rating_5 + a.avg_rating_6) / 6;
        // محاسبه میانگین کل برای استاد دوم
        const avgB = (b.avg_rating_1 + b.avg_rating_2 + b.avg_rating_3 + 
                      b.avg_rating_4 + b.avg_rating_5 + b.avg_rating_6) / 6;
        
        return avgB - avgA; // مرتب‌سازی از بیشترین به کمترین
      })
      .slice(0, 5);
  }, [allProfessors]);

  const hasActiveFilters = !!filters.search || filters.department !== 'all';

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-28 text-center">
        <Badge className="mb-6 px-4 py-1.5 bg-white/10 text-white border-white/20">
          <Sparkles className="w-4 h-4 ml-2 text-yellow-400" />
          دانشگاه علم و صنعت ایران
        </Badge>
        <h1 className="text-5xl font-black mb-6">علموص‌<span className="text-yellow-400">یار</span></h1>
        <p className="text-xl text-slate-300">تحلیل هوشمند نظرات واقعی دانشجویان</p>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="اساتید" value={stats.professors} icon={Users} iconColor="text-blue-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
          <StatCard title="دانشکده‌ها" value={stats.departments} icon={Building2} iconColor="text-emerald-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
          <StatCard title="درس‌ها" value={stats.courses} icon={BookOpen} iconColor="text-purple-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
          <StatCard title="نظرات" value={stats.reviews} icon={MessageSquare} iconColor="text-amber-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <SearchFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-8">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          {hasActiveFilters ? 'نتایج جستجو' : 'برترین اساتید'}
        </h2>

        <div className="grid gap-4">
          {(hasActiveFilters ? filteredProfessors : topProfessors).map((prof) => (
            /* ✅ اصلاح مسیر از professors به professor */
              <ProfessorCard professor={prof} />
          ))}
        </div>
      </div>
    </div>
  );
}