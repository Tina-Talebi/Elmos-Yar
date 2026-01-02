// // src/app/compare/page.tsx
// 'use client';

// import { useState, useMemo } from 'react';
// import { useReviews, type Review } from '@/hooks/useReviews';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { 
//   Users, Search, X, Plus, User
// } from 'lucide-react';
// import Link from 'next/link';
// import CompareChart from '@/components/compare/CompareChart';
// import ComparisonChart from '@/components/compare/ComparisonChart';

// const MAX_COMPARE = 5;

// export default function ComparePage() {
//   const { reviews, loading } = useReviews();
//   const [selectedIds, setSelectedIds] = useState<number[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   // اساتید منحصر به فرد با آمار
//   const professors = useMemo(() => {
//     if (loading) return [];
//     const map = new Map<number, any>();
//     reviews.forEach((r: Review) => {
//       const id = r.professor_id;
//       if (!map.has(id)) {
//         map.set(id, {
//           id,
//           name_standard: r.professor_name_standard,
//           department: r.department,
//           review_count: 0,
//           avg_rating_1: 0,
//           avg_rating_2: 0,
//           avg_rating_3: 0,
//           avg_rating_4: 0,
//           avg_rating_5: 0,
//           avg_rating_6: 0,
//         });
//       }
//       const p = map.get(id);
//       p.review_count++;
//       p.avg_rating_1 += r.rating_1;
//       p.avg_rating_2 += r.rating_2;
//       p.avg_rating_3 += r.rating_3;
//       p.avg_rating_4 += r.rating_4;
//       p.avg_rating_5 += r.rating_5;
//       p.avg_rating_6 += r.rating_6;
//     });
//     return Array.from(map.values()).map(p => ({
//       ...p,
//       avg_rating_1: p.avg_rating_1 / p.review_count,
//       avg_rating_2: p.avg_rating_2 / p.review_count,
//       avg_rating_3: p.avg_rating_3 / p.review_count,
//       avg_rating_4: p.avg_rating_4 / p.review_count,
//       avg_rating_5: p.avg_rating_5 / p.review_count,
//       avg_rating_6: p.avg_rating_6 / p.review_count,
//     }));
//   }, [reviews, loading]);

//   const selectedProfessors = useMemo(() => {
//     return professors.filter(p => selectedIds.includes(p.id));
//   }, [professors, selectedIds]);

//   const searchResults = useMemo(() => {
//     if (!searchTerm || searchTerm.length < 2) return [];
//     const term = searchTerm.toLowerCase();
//     return professors
//       .filter(p => 
//         !selectedIds.includes(p.id) && 
//         (p.name_standard.toLowerCase().includes(term) || p.department.toLowerCase().includes(term))
//       )
//       .slice(0, 10);
//   }, [professors, searchTerm, selectedIds]);

//   const addProfessor = (prof: any) => {
//     if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(prof.id)) {
//       setSelectedIds([...selectedIds, prof.id]);
//       setSearchTerm('');
//     }
//   };

//   const removeProfessor = (id: number) => {
//     setSelectedIds(selectedIds.filter(i => i !== id));
//   };

//   if (loading) return <div className="p-12 text-center text-2xl">در حال بارگذاری...</div>;

//   return (
//     <div className="container mx-auto p-8">
//       <h1 className="text-4xl font-bold text-center mb-8">مقایسه اساتید</h1>
//       <p className="text-center text-lg text-slate-600 mb-12">حداکثر {MAX_COMPARE} استاد را انتخاب کنید</p>

//       {/* انتخاب اساتید */}
//       <Card className="mb-8">
//         <CardContent className="pt-6">
//           <div className="relative mb-6">
//             <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//             <Input
//               placeholder="جستجوی استاد..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pr-12"
//               disabled={selectedIds.length >= MAX_COMPARE}
//             />

//             {searchResults.length > 0 && (
//               <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl">
//                 <CardContent className="p-2">
//                   {searchResults.map(prof => (
//                     <button
//                       key={prof.id}
//                       onClick={() => addProfessor(prof)}
//                       className="w-full flex items-center gap-3 p-3 rounded hover:bg-slate-50 text-right"
//                     >
//                       <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
//                         <User className="w-5 h-5" />
//                       </div>
//                       <div>
//                         <p className="font-medium">{prof.name_standard}</p>
//                         <p className="text-sm text-slate-500">{prof.department}</p>
//                       </div>
//                       <Plus className="w-5 h-5 text-slate-400" />
//                     </button>
//                   ))}
//                 </CardContent>
//               </Card>
//             )}
//           </div>

//           <div className="flex flex-wrap gap-3">
//             {selectedProfessors.map(prof => (
//               <Badge key={prof.id} className="px-4 py-2 gap-2">
//                 <User className="w-4 h-4" />
//                 {prof.name_standard}
//                 <button onClick={() => removeProfessor(prof.id)}>
//                   <X className="w-4 h-4" />
//                 </button>
//               </Badge>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* نمودار مقایسه */}
//       {selectedProfessors.length >= 2 ? (
//         <Card>
//           <CardHeader>
//             <CardTitle>مقایسه امتیازات تدریس</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <CompareChart professors={selectedProfessors} />
//           </CardContent>
//         </Card>
//       ) : (
//         <Card className="text-center py-20">
//           <CardContent>
//             <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
//             <p className="text-xl text-slate-600">حداقل ۲ استاد انتخاب کنید</p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
// src/app/compare/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useReviews, type Review } from '@/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Search, X, Plus, User, Star, 
  TrendingUp, TrendingDown
} from 'lucide-react';
import ComparisonChart from '@/components/compare/ComparisonChart'; // جدید
import GradingDonut from '@/components/shared/GradingDonut'; // موقت یا از Base44

const MAX_COMPARE = 5;

export default function ComparePage() {
  const { reviews, loading } = useReviews();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // اساتید با آمار کامل (از داده محلی)
  const professors = useMemo(() => {
    if (loading) return [];
    const map = new Map<number, any>();
    reviews.forEach((r: Review) => {
      const id = r.professor_id;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name_standard: r.professor_name_standard,
          department: r.department,
          review_count: 0,
          avg_rating_1: 0,
          avg_rating_2: 0,
          avg_rating_3: 0,
          avg_rating_4: 0,
          avg_rating_5: 0,
          avg_rating_6: 0,
          grading_easy_pct: 0,
          grading_fair_pct: 0,
          grading_hard_pct: 0,
          avg_sentiment: 0,
        });
      }
      const p = map.get(id);
      p.review_count++;
      p.avg_rating_1 += r.rating_1;
      p.avg_rating_2 += r.rating_2;
      p.avg_rating_3 += r.rating_3;
      p.avg_rating_4 += r.rating_4;
      p.avg_rating_5 += r.rating_5;
      p.avg_rating_6 += r.rating_6;
      p.avg_sentiment += r.sentiment_score;

      if (r.grading_encoded === 'آسان') p.grading_easy_pct++;
      if (r.grading_encoded === 'منصفانه') p.grading_fair_pct++;
      if (r.grading_encoded === 'سخت‌گیر') p.grading_hard_pct++;
    });

    return Array.from(map.values()).map(p => ({
      ...p,
      avg_rating_1: p.avg_rating_1 / p.review_count,
      avg_rating_2: p.avg_rating_2 / p.review_count,
      avg_rating_3: p.avg_rating_3 / p.review_count,
      avg_rating_4: p.avg_rating_4 / p.review_count,
      avg_rating_5: p.avg_rating_5 / p.review_count,
      avg_rating_6: p.avg_rating_6 / p.review_count,
      grading_easy_pct: Math.round((p.grading_easy_pct / p.review_count) * 100),
      grading_fair_pct: Math.round((p.grading_fair_pct / p.review_count) * 100),
      grading_hard_pct: Math.round((p.grading_hard_pct / p.review_count) * 100),
      avg_sentiment: p.avg_sentiment / p.review_count,
    }));
  }, [reviews, loading]);

  const selectedProfessors = useMemo(() => {
    return professors.filter(p => selectedIds.includes(p.id));
  }, [professors, selectedIds]);

  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return professors
      .filter(p => 
        !selectedIds.includes(p.id) && 
        (p.name_standard.toLowerCase().includes(term) || p.department.toLowerCase().includes(term))
      )
      .slice(0, 10);
  }, [professors, searchTerm, selectedIds]);

  const addProfessor = (prof: any) => {
    if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(prof.id)) {
      setSelectedIds([...selectedIds, prof.id]);
      setSearchTerm('');
    }
  };

  const removeProfessor = (id: number) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const getAvgRating = (prof: any) => {
    return (
      prof.avg_rating_1 +
      prof.avg_rating_2 +
      prof.avg_rating_3 +
      prof.avg_rating_4 +
      prof.avg_rating_5 +
      prof.avg_rating_6
    ) / 6;
  };

  if (loading) return <div className="p-12 text-center text-2xl">در حال بارگذاری اساتید...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            مقایسه اساتید
          </h1>
          <p className="text-slate-500">حداکثر {MAX_COMPARE} استاد را انتخاب و مقایسه کنید</p>
        </div>

        {/* Search & Selected */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="relative mb-6">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="جستجوی استاد برای مقایسه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 h-12 text-lg bg-slate-50 border-slate-200 rounded-xl"
                disabled={selectedIds.length >= MAX_COMPARE}
              />

              {searchResults.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-0 shadow-xl">
                  <CardContent className="p-2">
                    {searchResults.map(prof => (
                      <button
                        key={prof.id}
                        onClick={() => addProfessor(prof)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-right"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{prof.name_standard}</p>
                          <p className="text-sm text-slate-500">{prof.department.replace(/_/g, ' ')}</p>
                        </div>
                        <Plus className="w-5 h-5 text-slate-400" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedProfessors.map(prof => (
                <Badge 
                  key={prof.id}
                  className="bg-slate-100 text-slate-700 border-slate-200 px-4 py-2 text-sm gap-2"
                >
                  <User className="w-4 h-4" />
                  {prof.name_standard}
                  <button 
                    onClick={() => removeProfessor(prof.id)}
                    className="hover:text-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Badge>
              ))}
              {selectedIds.length < MAX_COMPARE && (
                <Badge variant="outline" className="border-dashed border-slate-300 text-slate-400 px-4 py-2">
                  <Plus className="w-4 h-4 ml-1" />
                  افزودن استاد
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Content */}
        {selectedProfessors.length === 0 ? (
          <Card className="border-0 bg-white/60">
            <CardContent className="py-20 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 mb-2">اساتید را انتخاب کنید</h3>
              <p className="text-slate-400">از کادر بالا اساتید مورد نظر را جستجو و انتخاب کنید</p>
            </CardContent>
          </Card>
        ) : selectedProfessors.length === 1 ? (
          <Card className="border-0 bg-white/60">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">برای مقایسه حداقل ۲ استاد انتخاب کنید</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* دو نمودار میله‌ای پیشرفته */}
            <ComparisonChart professors={selectedProfessors} />

            {/* جدول خلاصه */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">خلاصه مقایسه</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-y">
                      <tr>
                        <th className="text-right p-4 font-medium text-slate-600">معیار</th>
                        {selectedProfessors.map(prof => (
                          <th key={prof.id} className="text-center p-4 font-medium text-slate-600">
                            {prof.name_standard}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-4 text-slate-700">میانگین کل</td>
                        {selectedProfessors.map(prof => (
                          <td key={prof.id} className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span className="font-bold text-amber-700">{getAvgRating(prof).toFixed(1)}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-700">دانشکده</td>
                        {selectedProfessors.map(prof => (
                          <td key={prof.id} className="p-4 text-center">
                            <Badge variant="outline" className="bg-slate-50">
                              {prof.department.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-700">تعداد نظرات</td>
                        {selectedProfessors.map(prof => (
                          <td key={prof.id} className="p-4 text-center font-medium">
                            {prof.review_count}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-700">میانگین احساسات</td>
                        {selectedProfessors.map(prof => (
                          <td key={prof.id} className="p-4 text-center">
                            <div className={`inline-flex items-center gap-1 ${prof.avg_sentiment > 0 ? 'text-emerald-600' : prof.avg_sentiment < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                              {prof.avg_sentiment > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              {prof.avg_sentiment.toFixed(2)}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-700">نمره‌دهی آسان</td>
                        {selectedProfessors.map(prof => (
                          <td key={prof.id} className="p-4 text-center">
                            <span className={`font-medium ${prof.grading_easy_pct >= 50 ? 'text-emerald-600' : 'text-slate-600'}`}>
                              {prof.grading_easy_pct}%
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* دونات فردی */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedProfessors.map(prof => (
                <Card key={prof.id} className="border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      {prof.name_standard}
                    </CardTitle>
                    <p className="text-sm text-slate-500">توزیع نمره‌دهی</p>
                  </CardHeader>
                  <CardContent>
                    <GradingDonut 
                      easyPct={prof.grading_easy_pct}
                      fairPct={prof.grading_fair_pct}
                      hardPct={prof.grading_hard_pct}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}