// src/app/search/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useReviews, type Review } from '@/hooks/useReviews';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import Link from 'next/link';

export default function Search() {
  const { reviews, loading } = useReviews();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState('professor');
  const [deptFilter, setDeptFilter] = useState('all');
  const [gradingFilter, setGradingFilter] = useState('all');
  const [minReviewsFilter, setMinReviewsFilter] = useState('0');

  // استخراج اساتید منحصر به فرد با محاسبه میانگین
  const professors = useMemo(() => {
    if (loading || reviews.length === 0) return [];
    const map = new Map<number, any>();

    reviews.forEach((r: Review) => {
      const id = r.professor_id;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: r.professor_name_standard,
          department: r.department,
          reviewCount: 0,
          totalRating: 0,
          gradingCounts: { آسان: 0, منصفانه: 0, 'سخت‌گیر': 0 },
        });
      }
      const prof = map.get(id);
      prof.reviewCount++;
      prof.totalRating += (r.rating_1 + r.rating_2 + r.rating_3 + r.rating_4 + r.rating_5 + r.rating_6) / 6;
      prof.gradingCounts[r.grading_encoded]++;
    });

    return Array.from(map.values()).map(p => ({
      ...p,
      avgRating: p.totalRating / p.reviewCount,
      dominantGrading: Object.entries(p.gradingCounts).sort((a, b) => b[1] - a[1])[0][0],
    }));
  }, [reviews, loading]);

  // لیست دانشکده‌های منحصر به فرد
  const departments = useMemo(() => {
    const set = new Set(reviews.map(r => r.department));
    return ['all', ...Array.from(set).sort()];
  }, [reviews]);

  // جستجوی fuzzy ساده (مثل کد Base44)
  const fuzzyMatch = (text: string, query: string) => {
    if (!text || !query) return false;
    const t = text.toLowerCase().trim();
    const q = query.toLowerCase().trim();
    if (t.includes(q)) return true;
    return q.split(' ').every(word => t.includes(word));
  };

  // فیلتر اساتید
  const filteredProfessors = useMemo(() => {
    return professors.filter(p => {
      let match = true;
      if (searchQuery) {
        match = fuzzyMatch(p.name, searchQuery) || fuzzyMatch(p.department, searchQuery);
      }
      if (deptFilter !== 'all') match = match && p.department === deptFilter;
      if (gradingFilter !== 'all') match = match && p.dominantGrading === gradingFilter;
      if (parseInt(minReviewsFilter) > 0) match = match && p.reviewCount >= parseInt(minReviewsFilter);
      return match;
    });
  }, [professors, searchQuery, deptFilter, gradingFilter, minReviewsFilter]);

  // فیلتر دروس (برای تب درس)
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return [];
    return reviews.filter(r => 
      fuzzyMatch(r.course_name, searchQuery) || fuzzyMatch(r.comments, searchQuery)
    );
  }, [reviews, searchQuery]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-2xl">در حال بارگذاری ۴۲۶۰ نظر واقعی...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-bold text-blue-900">جستجوی پیشرفته</h1>
        <p className="text-xl text-gray-600">اساتید، دروس و نظرات را جستجو کنید</p>
      </div>

      {/* نوار جستجو */}
      <Card className="shadow-lg mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="نام استاد، درس یا کلمه کلیدی..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-14 text-lg"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "default" : "outline"}
              className="h-14 gap-2"
            >
              <Filter className="w-5 h-5" />
              فیلترها
            </Button>
          </div>

          {/* پنل فیلترها */}
          {showFilters && (
            <div className="mt-8 pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="دانشکده" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>
                      {d === 'all' ? 'همه دانشکده‌ها' : d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={gradingFilter} onValueChange={setGradingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="نمره‌دهی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="آسان">آسان</SelectItem>
                  <SelectItem value="منصفانه">منصفانه</SelectItem>
                  <SelectItem value="سخت‌گیر">سخت‌گیر</SelectItem>
                </SelectContent>
              </Select>

              <Select value={minReviewsFilter} onValueChange={setMinReviewsFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="حداقل تعداد نظر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">همه</SelectItem>
                  <SelectItem value="5">حداقل ۵ نظر</SelectItem>
                  <SelectItem value="10">حداقل ۱۰ نظر</SelectItem>
                  <SelectItem value="20">حداقل ۲۰ نظر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نتایج */}
      {searchQuery ? (
        <Tabs value={searchType} onValueChange={setSearchType} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="professor">
              اساتید ({filteredProfessors.length})
            </TabsTrigger>
            <TabsTrigger value="course">
              دروس ({filteredCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professor">
            {filteredProfessors.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-xl text-gray-500">استادی یافت نشد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
                {filteredProfessors.map(prof => (
                  <Link href={`/professor/${prof.id}`} key={prof.id}>
                    <Card className="hover:shadow-xl transition cursor-pointer h-full border-r-4 border-r-blue-600">
                      <CardHeader>
                        <CardTitle className="text-lg">{prof.name}</CardTitle>
                        <CardDescription>{prof.department}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-1">تعداد نظرات: {prof.reviewCount}</p>
                        <p className="text-sm mb-1">میانگین امتیاز: {prof.avgRating.toFixed(1)} / 10</p>
                        <p className="text-sm font-medium">نمره‌دهی غالب: {prof.dominantGrading}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="course">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.slice(0, 30).map((review, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-base">{review.course_name}</CardTitle>
                    <CardDescription>{review.professor_name_standard} — {review.term}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{review.comments}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="text-center py-20 border-r-4 border-r-blue-600">
          <CardContent>
            <SearchIcon className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <p className="text-xl text-gray-500">
              برای شروع، نام استاد یا درس را وارد کنید
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}