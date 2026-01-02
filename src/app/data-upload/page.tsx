// src/app/data-upload/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Database, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

export default function DataUpload() {
  const { reviews, loading } = useReviews();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">بارگذاری داده‌ها</h1>
          <p className="text-slate-500">وضعیت داده‌های پروژه علموص‌یار</p>
        </div>

        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Database className="w-6 h-6 text-green-600" />
              داده‌ها با موفقیت بارگذاری شده‌اند
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <CheckCircle2 className="w-20 h-20 text-emerald-500" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-emerald-600">
                {loading ? 'در حال بارگذاری...' : `${reviews.length} نظر واقعی`}
              </p>
              <p className="text-slate-600">
                از دانشجویان دانشگاه علم و صنعت ایران (ترم‌های مختلف)
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="font-medium">منبع داده</p>
                  <p className="text-sm text-slate-500">فایل CSV تبدیل شده به JSON استاتیک</p>
                </div>
              </div>

              <div className="text-sm text-slate-600 space-y-1">
                <p>• شامل ستون‌های: نام استاد، دانشکده، درس، rating_1 تا rating_6، نمره‌دهی، sentiment_score، نظرات</p>
                <p>• پردازش شده با: Cleaning, Normalization, Sentiment Analysis</p>
                <p>• آماده برای: جستجو، مقایسه، Word Cloud، Recommender</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button asChild size="lg">
                <a href="/search">
                  <RefreshCw className="w-5 h-5 ml-2" />
                  برو به جستجو
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}