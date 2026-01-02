// src/components/search/SearchFilters.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useMemo } from "react"


const GRADING_OPTIONS = [
  { value: 'all', label: 'همه' },
  { value: 'آسان', label: 'آسان' },
  { value: 'منصفانه', label: 'منصفانه' },
  { value: 'سخت‌گیر', label: 'سخت‌گیر' },
];

export default function SearchFilters({ filters, onFilterChange }) {
  const { reviews, loading } = useReviews();
  const [isOpen, setIsOpen] = useState(false);

  // استخراج دانشکده‌های منحصر به فرد از داده واقعی
  const departments = useMemo(() => {
    if (loading || reviews.length === 0) return [];
    const set = new Set(reviews.map(r => r.department));
    return ['all', ...Array.from(set).sort()];
  }, [reviews, loading]);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false;
    if (key === 'minRating') return value > 0;
    if (key === 'minReviews') return value > 0;
    if (key === 'minSentiment') return value > -1;
    return value && value !== 'all';
  }).length;

  const handleReset = () => {
    onFilterChange({
      search: '',
      department: 'all',
      grading: 'all',
      minRating: 0,
      minReviews: 0,
      minSentiment: -1,
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="جستجوی استاد، درس یا کلمه کلیدی..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pr-12 h-14 text-lg bg-white border-slate-200 rounded-2xl shadow-sm"
        />

        {/* Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 hover:bg-slate-100"
            >
              <SlidersHorizontal className="w-5 h-5 text-slate-500" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl">فیلترهای پیشرفته</SheetTitle>
              <SheetDescription>
                نتایج را بر اساس معیارهای دلخواه محدود کنید
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* دانشکده — از داده واقعی */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">دانشکده</Label>
                <Select 
                  value={filters.department || 'all'} 
                  onValueChange={(v) => onFilterChange({ ...filters, department: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="انتخاب دانشکده" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d} value={d}>
                        {d === 'all' ? 'همه دانشکده‌ها' : d.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* نوع نمره‌دهی */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">نوع نمره‌دهی</Label>
                <Select 
                  value={filters.grading || 'all'} 
                  onValueChange={(v) => onFilterChange({ ...filters, grading: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="انتخاب نوع نمره‌دهی" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADING_OPTIONS.map(g => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* حداقل امتیاز */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">حداقل امتیاز کلی</Label>
                  <span className="text-sm font-mono">{(filters.minRating || 0).toFixed(1)}</span>
                </div>
                <Slider
                  value={[filters.minRating || 0]}
                  onValueChange={([v]) => onFilterChange({ ...filters, minRating: v })}
                  max={10}
                  step={0.5}
                />
              </div>

              {/* حداقل تعداد نظر */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">حداقل تعداد نظر</Label>
                  <span className="text-sm font-mono">{filters.minReviews || 0}</span>
                </div>
                <Slider
                  value={[filters.minReviews || 0]}
                  onValueChange={([v]) => onFilterChange({ ...filters, minReviews: v })}
                  max={50}
                  step={1}
                />
              </div>

              {/* حداقل احساسات */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">حداقل احساسات</Label>
                  <span className="text-sm font-mono">{(filters.minSentiment || -1).toFixed(1)}</span>
                </div>
                <Slider
                  value={[filters.minSentiment || -1]}
                  onValueChange={([v]) => onFilterChange({ ...filters, minSentiment: v })}
                  min={-1}
                  max={1}
                  step={0.1}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <RotateCcw className="w-4 h-4 ml-2" />
                  پاک کردن فیلترها
                </Button>
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  اعمال فیلترها
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Badge */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.department && filters.department !== 'all' && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              دانشکده: {filters.department.replace(/_/g, ' ')}
              <X 
                className="w-3.5 h-3.5 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, department: 'all' })}
              />
            </Badge>
          )}
          {filters.grading && filters.grading !== 'all' && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              نمره‌دهی: {filters.grading}
              <X 
                className="w-3.5 h-3.5 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, grading: 'all' })}
              />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              امتیاز ≥ {filters.minRating}
              <X 
                className="w-3.5 h-3.5 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, minRating: 0 })}
              />
            </Badge>
          )}
          {filters.minReviews > 0 && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              نظرات ≥ {filters.minReviews}
              <X 
                className="w-3.5 h-3.5 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, minReviews: 0 })}
              />
            </Badge>
          )}
          {filters.minSentiment > -1 && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              احساسات ≥ {(filters.minSentiment).toFixed(1)}
              <X 
                className="w-3.5 h-3.5 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, minSentiment: -1 })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}