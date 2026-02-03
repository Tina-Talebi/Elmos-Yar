// 'use client';

// import { useState, useMemo } from 'react';
// import { useReviews } from '@/hooks/useReviews';
// import { Badge } from '@/components/ui/badge';
// import {
//   Users,
//   MessageSquare,
//   Sparkles,
//   TrendingUp,
//   Building2,
//   BookOpen,
// } from 'lucide-react';

// import ProfessorCard from '@/components/shared/ProfessorCard';
// import StatCard from '@/components/shared/StatCard';
// import SearchFilters from '@/components/shared/SearchFilters';

// // تعریف تایپ برای فیلترها
// type Filters = {
//   search: string;
//   department: string;
//   grading: string;
//   minRating: number;
//   minReviews: number;
//   minSentiment: number;
// };

// // تعریف تایپ برای اساتید تجمیع شده با قابلیت کلید پویا
// type ProfAgg = {
//   id: string; 
//   name_standard: string;
//   department: string;
//   review_count: number;
//   avg_sentiment: number;
//   grading_easy_pct: number;
//   grading_hard_pct: number;
//   grading_fair_pct: number;
//   courses: string[];
//   [key: string]: any; // برای دسترسی به avg_rating_1 تا avg_rating_6
// };

// export default function Home() {
//   const { reviews, loading } = useReviews();

//   const [filters, setFilters] = useState<Filters>({
//     search: '',
//     department: 'all',
//     grading: 'all',
//     minRating: 0,
//     minReviews: 0,
//     minSentiment: -1,
//   });

//   // ۱. محاسبه آمار کلی هدر
//   const stats = useMemo(() => {
//     if (loading || !reviews.length) {
//       return { professors: 0, departments: 0, courses: 0, reviews: 0 };
//     }
//     const profSet = new Set(reviews.map((r) => r.professor_name_standard));
//     const deptSet = new Set(reviews.map((r) => r.department));
//     const courseSet = new Set(reviews.map((r) => r.course_name));

//     return {
//       professors: profSet.size,
//       departments: deptSet.size,
//       courses: courseSet.size,
//       reviews: reviews.length,
//     };
//   }, [reviews, loading]);

//   // ۲. تجمیع داده‌ها (Data Aggregation) بر اساس منطق دیتای واقعی شما
//   const allProfessors: ProfAgg[] = useMemo(() => {
//     const map = new Map<string, ProfAgg>();

//     // تابع کمکی برای رفع مشکل حروف ی و ک فارسی/عربی
//     const normalize = (text: string) => 
//       text.replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();

//     reviews.forEach((r: any) => {
//       const key = r.professor_name_standard;
//       if (!key) return;

//       if (!map.has(key)) {
//         map.set(key, {
//           id: String(r.professor_id),
//           name_standard: key,
//           department: r.department || "نامشخص",
//           review_count: 0,
//           avg_rating_1: 0, avg_rating_2: 0, avg_rating_3: 0,
//           avg_rating_4: 0, avg_rating_5: 0, avg_rating_6: 0,
//           avg_sentiment: 0,
//           grading_easy_pct: 0,
//           grading_hard_pct: 0,
//           grading_fair_pct: 0,
//           courses: [],
//         });
//       }

//       const p = map.get(key)!;
//       p.review_count += 1;
      
//       // جمع امتیازات (Ratings) با مدیریت NaN
//       for (let i = 1; i <= 6; i++) {
//         const val = parseFloat(r[`rating_${i}`]);
//         p[`avg_rating_${i}`] += isNaN(val) ? 0 : val;
//       }

//       // تحلیل احساسات بر اساس ستون final_sentiment
//       const sentiment = String(r.final_sentiment || "").toLowerCase().trim();
//       if (sentiment === 'positive') p.avg_sentiment += 1;
//       else if (sentiment === 'negative' || sentiment === 'negetive') p.avg_sentiment -= 1;

//       // لیست دروس
//       if (r.course_name && !p.courses.includes(r.course_name)) p.courses.push(r.course_name);

//       // نمره‌دهی بر اساس کلمات کلیدی موجود در جملات ستون grading
//       const gText = normalize(String(r.grading || ""));
//       const easyKeywords = ['خوبی', 'آسان', 'بالا', 'راه میاد', 'دست و دلباز', 'خوب نمره'];
//       const hardKeywords = ['سخت', 'پایین', 'کم نمره', 'اذیت', 'نمره نمیده', 'بد نمره'];

//       if (easyKeywords.some(kw => gText.includes(kw))) p.grading_easy_pct += 1;
//       else if (hardKeywords.some(kw => gText.includes(kw))) p.grading_hard_pct += 1;
//       else p.grading_fair_pct += 1;
//     });

//     // محاسبه میانگین‌ها و درصدها
//     return Array.from(map.values()).map((p) => {
//       const n = p.review_count || 1;
//       const totalG = p.grading_easy_pct + p.grading_hard_pct + p.grading_fair_pct || 1;
      
//       return {
//         ...p,
//         avg_rating_1: p.avg_rating_1 / n,
//         avg_rating_2: p.avg_rating_2 / n,
//         avg_rating_3: p.avg_rating_3 / n,
//         avg_rating_4: p.avg_rating_4 / n,
//         avg_rating_5: p.avg_rating_5 / n,
//         avg_rating_6: p.avg_rating_6 / n,
//         avg_sentiment: p.avg_sentiment / n,
//         grading_easy_pct: (p.grading_easy_pct / totalG) * 100,
//         grading_hard_pct: (p.grading_hard_pct / totalG) * 100,
//         grading_fair_pct: (p.grading_fair_pct / totalG) * 100,
//       };
//     });
//   }, [reviews]);

//   // ۳. فیلتر کردن و مرتب‌سازی
//   const filteredProfessors = useMemo(() => {
//     const filtered = allProfessors.filter((prof) => {
//       // جستجو
//       if (filters.search) {
//         const s = filters.search.toLowerCase();
//         const match = prof.name_standard.toLowerCase().includes(s) || 
//                       prof.department.toLowerCase().includes(s) ||
//                       prof.courses.some(c => c.toLowerCase().includes(s));
//         if (!match) return false;
//       }

//       // فیلتر دانشکده
//       if (filters.department !== 'all' && prof.department !== filters.department) return false;

//       // فیلتر نمره‌دهی
//       if (filters.grading !== 'all') {
//         if (filters.grading === 'آسان' && prof.grading_easy_pct < 40) return false;
//         if (filters.grading === 'سخت‌گیر' && prof.grading_hard_pct < 40) return false;
//       }

//       // فیلتر نمره کل (میانگین هر ۶ معیار)
//       const avg = (prof.avg_rating_1 + prof.avg_rating_2 + prof.avg_rating_3 + 
//                    prof.avg_rating_4 + prof.avg_rating_5 + prof.avg_rating_6) / 6;
//       if (avg < filters.minRating) return false;

//       return true;
//     });

//     // مرتب‌سازی نزولی بر اساس امتیاز
//     return filtered.sort((a, b) => {
//       const avgA = (a.avg_rating_1 + a.avg_rating_2 + a.avg_rating_3 + a.avg_rating_4 + a.avg_rating_5 + a.avg_rating_6) / 6;
//       const avgB = (b.avg_rating_1 + b.avg_rating_2 + b.avg_rating_3 + b.avg_rating_4 + b.avg_rating_5 + b.avg_rating_6) / 6;
//       return avgB - avgA;
//     });
//   }, [allProfessors, filters]);

//   // اساتید برتر برای حالت بدون جستجو
//   const topProfessors = useMemo(() => {
//     return filteredProfessors.filter(p => p.review_count >= 2).slice(0, 5);
//   }, [filteredProfessors]);

//   const hasActiveFilters = !!filters.search || filters.department !== 'all';

//   if (loading) return <div className="p-20 text-center text-xl">در حال بارگذاری داده‌های علموص‌بار...</div>;

//   return (
//     <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
//       {/* Hero Section */}
//       <div className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-28 text-center">
//         <Badge className="mb-6 px-4 py-1.5 bg-white/10 text-white border-white/20">
//           <Sparkles className="w-4 h-4 ml-2 text-yellow-400" />
//           دانشگاه علم و صنعت ایران
//         </Badge>
//         <h1 className="text-5xl font-black mb-6 tracking-tight">علموص‌<span className="text-yellow-400">یار</span></h1>
//         <p className="text-xl text-slate-300">راهنمای هوشمند انتخاب واحد بر اساس تجربیات واقعی</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatCard title="اساتید" value={stats.professors} icon={Users} iconColor="text-blue-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
//           <StatCard title="دانشکده‌ها" value={stats.departments} icon={Building2} iconColor="text-emerald-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
//           <StatCard title="درس‌ها" value={stats.courses} icon={BookOpen} iconColor="text-purple-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
//           <StatCard title="نظرات" value={stats.reviews} icon={MessageSquare} iconColor="text-amber-500" bgColor="bg-white" subtitle={undefined} trend={undefined} trendUp={undefined} />
//         </div>
//       </div>

//       {/* Filters & Search */}
//       <div className="max-w-6xl mx-auto px-4 py-12">
//         <SearchFilters filters={filters} onFilterChange={setFilters} />
//       </div>

//       {/* Results Grid */}
//       <div className="max-w-6xl mx-auto px-4 pb-20">
//         <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-8">
//           <TrendingUp className="w-6 h-6 text-emerald-500" />
//           {hasActiveFilters ? 'نتایج جستجو' : 'اساتید پیشنهادی'}
//         </h2>

//         <div className="grid gap-4">
//           {(hasActiveFilters ? filteredProfessors : topProfessors).map((prof) => (
//              <ProfessorCard key={prof.id} professor={prof} />
//           ))}
//           {filteredProfessors.length === 0 && (
//             <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
//               <p className="text-slate-500 text-lg">استادی با این مشخصات یافت نشد.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

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

    // جستجو
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(prof =>
        prof.name_standard.toLowerCase().includes(s) ||
        prof.department.toLowerCase().includes(s) ||
        prof.courses.some(c => c.toLowerCase().includes(s))
      );
    }

    // فیلتر دانشکده
    if (filters.department !== 'all') {
      result = result.filter(prof => prof.department === filters.department);
    }

    // فیلتر نمره‌دهی
    if (filters.grading === 'آسان') {
      result = result.filter(prof => prof.grading_easy_pct >= 40);
    } else if (filters.grading === 'سخت‌گیر') {
      result = result.filter(prof => prof.grading_hard_pct >= 40);
    }

    // مرتب‌سازی بر اساس امتیاز کل (نزولی)
    return result.sort((a, b) => {
      const avgA = (a.avg_rating_1 + a.avg_rating_2 + a.avg_rating_3 + a.avg_rating_4 + a.avg_rating_5 + a.avg_rating_6) / 6;
      const avgB = (b.avg_rating_1 + b.avg_rating_2 + b.avg_rating_3 + b.avg_rating_4 + b.avg_rating_5 + b.avg_rating_6) / 6;
      return avgB - avgA;
    });
  }, [allProfessors, filters]);

  // اساتید پیشنهادی (وقتی فیلتری اعمال نشده)
  const topProfessors = useMemo(() => {
    return allProfessors
      .filter(p => p.review_count >= 2)
      .sort((a, b) => {
        const avgA = (a.avg_rating_1 + a.avg_rating_2 + a.avg_rating_3 + a.avg_rating_4 + a.avg_rating_5 + a.avg_rating_6) / 6;
        const avgB = (b.avg_rating_1 + b.avg_rating_2 + b.avg_rating_3 + b.avg_rating_4 + b.avg_rating_5 + b.avg_rating_6) / 6;
        return avgB - avgA;
      })
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
          <StatCard title="اساتید" value={stats.professors} icon={Users} iconColor="text-blue-500" bgColor="bg-white" />
          <StatCard title="دانشکده‌ها" value={stats.departments} icon={Building2} iconColor="text-emerald-500" bgColor="bg-white" />
          <StatCard title="درس‌ها" value={stats.courses} icon={BookOpen} iconColor="text-purple-500" bgColor="bg-white" />
          <StatCard title="نظرات" value={stats.reviews} icon={MessageSquare} iconColor="text-amber-500" bgColor="bg-white" />
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