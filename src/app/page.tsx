// app/page.tsx
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
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Building2,
  Search,
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

  // آمار کلی
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

  // تجمیع reviews به سطح استاد
  type ProfAgg = {
    id: string; // می‌توان از نام استاندارد به‌عنوان کلید استفاده کرد
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

  const professors: ProfAgg[] = useMemo(() => {
    const map = new Map<string, ProfAgg>();

    reviews.forEach((r: Review) => {
      const key = r.professor_name_standard;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
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

      if (!p.courses.includes(r.course_name)) {
        p.courses.push(r.course_name);
      }

      if (r.grading_encoded === 'آسان') p.grading_easy_pct += 1;
      if (r.grading_encoded === 'سخت‌گیر') p.grading_hard_pct += 1;
      if (r.grading_encoded === 'منصفانه') p.grading_fair_pct += 1;
    });

    // نرمال‌سازی میانگین‌ها و درصدها
    return Array.from(map.values()).map((p) => {
      const n = p.review_count || 1;
      const totalGrading =
        p.grading_easy_pct + p.grading_hard_pct + p.grading_fair_pct || 1;

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

  // اعمال فیلترها روی professors تجمیع‌شده
  const filteredProfessors = useMemo(() => {
    return professors.filter((prof) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchName = prof.name_standard.toLowerCase().includes(search);
        const matchDept = prof.department?.toLowerCase().includes(search);
        const matchCourse = prof.courses?.some((c) =>
          c.toLowerCase().includes(search),
        );
        if (!matchName && !matchDept && !matchCourse) return false;
      }

      if (filters.department !== 'all' && prof.department !== filters.department)
        return false;

      if (filters.grading !== 'all') {
        if (filters.grading === 'آسان' && (prof.grading_easy_pct || 0) < 50)
          return false;
        if (filters.grading === 'سخت‌گیر' && (prof.grading_hard_pct || 0) < 50)
          return false;
        if (filters.grading === 'منصفانه' && (prof.grading_fair_pct || 0) < 40)
          return false;
      }

      const avgRating =
        (prof.avg_rating_1 +
          prof.avg_rating_2 +
          prof.avg_rating_3 +
          prof.avg_rating_4 +
          prof.avg_rating_5 +
          prof.avg_rating_6) /
        6;
      if (avgRating < filters.minRating) return false;

      if ((prof.review_count || 0) < filters.minReviews) return false;

      if ((prof.avg_sentiment || 0) < filters.minSentiment) return false;

      return true;
    });
  }, [professors, filters]);

  const topProfessors = useMemo(() => {
    return [...professors]
      .filter((p) => (p.review_count || 0) >= 3)
      .sort((a, b) => {
        const avgA =
          (a.avg_rating_1 +
            a.avg_rating_2 +
            a.avg_rating_3 +
            a.avg_rating_4 +
            a.avg_rating_5 +
            a.avg_rating_6) /
          6;
        const avgB =
          (b.avg_rating_1 +
            b.avg_rating_2 +
            b.avg_rating_3 +
            b.avg_rating_4 +
            b.avg_rating_5 +
            b.avg_rating_6) /
          6;
        return avgB - avgA;
      })
      .slice(0, 5);
  }, [professors]);

  const hasActiveFilters =
    !!filters.search ||
    filters.department !== 'all' ||
    filters.grading !== 'all' ||
    filters.minRating > 0 ||
    filters.minReviews > 0 ||
    filters.minSentiment > -1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMzRoNHY0aC00ek0yMCAyMGg0djRoLTR6TTM2IDIwaDR2NGgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <Badge className="mb-6 px-4 py-1.5 bg-white/10 text-white border-white/20">
            <Sparkles className="w-4 h-4 ml-2" />
            دانشگاه علم و صنعت ایران
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
            علموص‌یار
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            انتخاب هوشمندانه استاد و درس با تحلیل نظرات واقعی دانشجویان
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/search">
              <Button className="bg-white text-slate-900 h-14 px-8 text-lg">
                <Search className="w-5 h-5 ml-2" />
                جستجوی استاد
              </Button>
            </Link>
            <Link href="/recommender">
              <Button
                variant="outline"
                className="border-white/30 text-white h-14 px-8 text-lg"
              >
                <Sparkles className="w-5 h-5 ml-2" />
                پیشنهاد هوشمند
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="اساتید"
            value={stats.professors}
            icon={Users}
            iconColor="text-blue-500"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="دانشکده‌ها"
            value={stats.departments}
            icon={Building2}
            iconColor="text-emerald-500"
            bgColor="bg-emerald-100"
          />
          <StatCard
            title="درس‌ها"
            value={stats.courses}
            icon={BookOpen}
            iconColor="text-purple-500"
            bgColor="bg-purple-100"
          />
          <StatCard
            title="نظرات"
            value={stats.reviews}
            icon={MessageSquare}
            iconColor="text-amber-500"
            bgColor="bg-amber-100"
          />
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SearchFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Results / Top Professors */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {hasActiveFilters ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                نتایج جستجو
                <span className="text-slate-400 font-normal mr-2">
                  ({filteredProfessors.length} استاد)
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="h-32 animate-pulse bg-slate-100 border-0"
                  />
                ))}
              </div>
            ) : filteredProfessors.length > 0 ? (
              <div className="grid gap-4">
                {filteredProfessors.slice(0, 20).map((prof) => (
                  <ProfessorCard key={prof.id} professor={prof} />
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-white/60">
                <CardContent className="py-16 text-center">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    نتیجه‌ای یافت نشد
                  </h3>
                  <p className="text-slate-400">فیلترهای خود را تغییر دهید</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                برترین اساتید
              </h2>
              <Link href="/search">
                <Button variant="ghost" className="text-slate-600">
                  مشاهده همه
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="h-32 animate-pulse bg-slate-100 border-0"
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {topProfessors.map((prof) => (
                  <ProfessorCard key={prof.id} professor={prof} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
