'use client';
import { calculateProfessorScore } from './calculateProfessorScore';

import { useState, useMemo } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MessageSquare,
  Sparkles,
  Building2,
  BookOpen,
} from 'lucide-react';

import ProfessorCard from '@/components/shared/ProfessorCard';
import StatCard from '@/components/shared/StatCard';

// تعریف تایپ برای فیلترها
type Filters = {
  search: string;
  department: string;
  grading: string;
};

// تعریف تایپ برای اساتید تجمیع شده
type ProfAgg = {
  id: string; 
  name_standard: string;
  department: string;
  review_count: number;
  avg_sentiment: number;
  grading_easy_pct: number;
  grading_hard_pct: number;
  grading_fair_pct: number;
  courses: string[];
  avg_rating_1: number;
  avg_rating_2: number;
  avg_rating_3: number;
  avg_rating_4: number;
  avg_rating_5: number;
  avg_rating_6: number;
};

export default function Home() {
  const { reviews, loading } = useReviews();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    department: 'all',
    grading: 'all',
  });

  // ۱. محاسبه آمار کلی هدر
  const stats = useMemo(() => {
    if (loading || !reviews.length) {
      return { professors: 0, departments: 0, courses: 0, reviews: 0 };
    }
    const profSet = new Set(reviews.map((r: any) => r.professor_name_standard));
    const deptSet = new Set(reviews.map((r: any) => r.department));
    const courseSet = new Set(reviews.map((r: any) => r.course_name));

    return {
      professors: profSet.size,
      departments: deptSet.size,
      courses: courseSet.size,
      reviews: reviews.length,
    };
  }, [reviews, loading]);

  // ۲. تجمیع داده‌ها بر اساس professor_name_standard
  const allProfessors: ProfAgg[] = useMemo(() => {
    const map = new Map<string, ProfAgg>();

    reviews.forEach((r: any) => {
      const key = r.professor_name_standard;
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          id: String(r.professor_id),
          name_standard: key,
          department: r.department || "نامشخص",
          review_count: 0,
          avg_rating_1: 0, avg_rating_2: 0, avg_rating_3: 0,
          avg_rating_4: 0, avg_rating_5: 0, avg_rating_6: 0,
          avg_sentiment: 0,
          grading_easy_pct: 0,
          grading_hard_pct: 0,
          grading_fair_pct: 0,
          courses: [],
        });
      }

      const p = map.get(key)!;
      p.review_count += 1;

      // جمع امتیازات
      for (let i = 1; i <= 6; i++) {
        const val = parseFloat(r[`rating_${i}`]);
        p[`avg_rating_${i}`] += isNaN(val) ? 0 : val;
      }

      // احساسات
      const sentiment = String(r.final_sentiment || "").toLowerCase().trim();
      if (sentiment === 'positive') p.avg_sentiment += 1;
      else if (sentiment === 'negative' || sentiment === 'negetive') p.avg_sentiment -= 1;

      // دروس
      if (r.course_name && !p.courses.includes(r.course_name)) p.courses.push(r.course_name);

      // نمره‌دهی — منطق پیشرفته و واقع‌بینانه
      const gText = String(r.grading || "").toLowerCase().trim();

      if (
        gText.includes("نمره خوبی نمیشه گرفت") ||
        gText.includes("نمره خوبی نمیشه ازشون گرفت")||
        gText.includes("سخت میشه نمره") ||
        gText.includes("نمره خوب گرفتن سخت") ||
        gText.includes("کمتر از حق") ||
        gText.includes("از حقت کمتر") ||
        gText.includes("سختگیر") ||
        gText.includes("سخت گیر") ||
        gText.includes("کمتر") ||
        gText.includes("پایین") ||
        gText.includes("افتضاح") ||
        gText.includes("بد") ||
        gText.includes("رندوم") ||
        gText.includes("شانسی") ||
        gText.includes("غیر منطقی") ||
        gText.includes("عجیب")
      ) {
        p.grading_hard_pct += 1;
      } else if (
        gText.includes("دست باز") ||
        gText.includes("ارفاق") ||
        gText.includes("مهربان") ||
        gText.includes("راحت میشه") ||
        gText.includes("نمره راحت") ||
        gText.includes("بالا میده") ||
        gText.includes("نمره بالا")
      ) {
        p.grading_easy_pct += 1;
      } else {
        p.grading_fair_pct += 1;
      }
    });

    // محاسبه میانگین و درصدها
    return Array.from(map.values()).map((p) => {
      const n = p.review_count || 1;
      const totalG = p.grading_easy_pct + p.grading_hard_pct + p.grading_fair_pct || 1;

      return {
        ...p,
        avg_rating_1: p.avg_rating_1 / n,
        avg_rating_2: p.avg_rating_2 / n,
        avg_rating_3: p.avg_rating_3 / n,
        avg_rating_4: p.avg_rating_4 / n,
        avg_rating_5: p.avg_rating_5 / n,
        avg_rating_6: p.avg_rating_6 / n,
        avg_sentiment: p.avg_sentiment / n,
        grading_easy_pct: Math.round((p.grading_easy_pct / totalG) * 100),
        grading_hard_pct: Math.round((p.grading_hard_pct / totalG) * 100),
        grading_fair_pct: Math.round((p.grading_fair_pct / totalG) * 100),
      };
    });
  }, [reviews]);

  // ۳. فیلتر کردن اساتید
  const filteredProfessors = useMemo(() => {
    let result = allProfessors;
  
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(prof =>
        prof.name_standard.toLowerCase().includes(s) ||
        prof.department.toLowerCase().includes(s) ||
        prof.courses.some(c => c.toLowerCase().includes(s))
      );
    }
  
    if (filters.department !== 'all') {
      result = result.filter(prof => prof.department === filters.department);
    }
  
    const label = filters.grading?.trim();
  
    if (label === 'آسان') {
      result = result.filter(prof =>
        prof.grading_easy_pct >= 50 &&
        prof.grading_easy_pct > prof.grading_fair_pct &&
        prof.grading_easy_pct > prof.grading_hard_pct
      );
    } else if (label === 'منصفانه') {
      result = result.filter(prof =>
        prof.grading_fair_pct >= 50 &&
        prof.grading_fair_pct > prof.grading_easy_pct &&
        prof.grading_fair_pct > prof.grading_hard_pct
      );
    } else if (label === 'سخت‌گیر') {
      result = result.filter(prof =>
        prof.grading_hard_pct >= 50 &&
        prof.grading_hard_pct > prof.grading_easy_pct &&
        prof.grading_hard_pct > prof.grading_fair_pct
      );
    }
  
    return result.sort(
      (a, b) => calculateProfessorScore(b) - calculateProfessorScore(a)
    );
  }, [allProfessors, filters]);
  

  // اساتید پیشنهادی (وقتی فیلتری اعمال نشده)
  const topProfessors = useMemo(() => {
    return allProfessors
      .filter(p => p.review_count >= 2)
      .sort(
        (a, b) => calculateProfessorScore(b) - calculateProfessorScore(a)
      )
      .slice(0, 8);
  }, [allProfessors]);
  

  const hasActiveFilters = !!filters.search || filters.department !== 'all' || filters.grading !== 'all';

  if (loading) return <div className="p-20 text-center text-xl">در حال بارگذاری داده‌های علموص‌یار...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-28 text-center">
        <Badge className="mb-6 px-4 py-1.5 bg-white/10 text-white border-white/20">
          <Sparkles className="w-4 h-4 ml-2 text-yellow-400" />
          دانشگاه علم و صنعت ایران
        </Badge>
        <h1 className="text-5xl font-black mb-6 tracking-tight">علموص‌<span className="text-yellow-400">یار</span></h1>
        <p className="text-xl text-slate-300">راهنمای هوشمند انتخاب واحد بر اساس تجربیات واقعی</p>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="اساتید" value={stats.professors} icon={Users} iconColor="text-blue-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
          <StatCard title="دانشکده‌ها" value={stats.departments} icon={Building2} iconColor="text-emerald-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
          <StatCard title="درس‌ها" value={stats.courses} icon={BookOpen} iconColor="text-purple-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
          <StatCard title="نظرات" value={stats.reviews} icon={MessageSquare} iconColor="text-amber-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            {/* جستجو */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">جستجو</label>
              <input
                type="text"
                placeholder="نام استاد، درس یا دانشکده..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* دانشکده */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">دانشکده</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="all">همه دانشکده‌ها</option>
                {Array.from(new Set(allProfessors.map(p => p.department))).sort().map(dept => (
                  <option key={dept} value={dept}>{dept.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* نمره‌دهی */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">نمره‌دهی</label>
              <select
                value={filters.grading}
                onChange={(e) => setFilters({ ...filters, grading: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="all">همه</option>
                <option value="آسان">آسان و دست‌باز</option>
                <option value="سخت‌گیر">سخت‌گیر</option>
                <option value="منصفانه">منصفانه</option>
              </select>
            </div>

            {/* پاک کردن فیلترها */}
            <div className="flex justify-end">
              <button
                onClick={() => setFilters({ search: '', department: 'all', grading: 'all' })}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-black text-slate-800 mb-8">
          {hasActiveFilters ? 'نتایج جستجو' : 'اساتید پیشنهادی'}
        </h2>

        <div className="grid gap-4">
          {(hasActiveFilters ? filteredProfessors : topProfessors).map((prof) => (
            <ProfessorCard key={prof.id} professor={prof} />
          ))}

          {hasActiveFilters && filteredProfessors.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 text-lg">استادی با این مشخصات یافت نشد.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}