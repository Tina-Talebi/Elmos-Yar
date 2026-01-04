// src/components/shared/ProfessorCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  User,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

type Professor = {
  id: string | number;
  name_standard: string;
  department: string;
  review_count?: number;
  courses?: string[];
  avg_rating_1?: number;
  avg_rating_2?: number;
  avg_rating_3?: number;
  avg_rating_4?: number;
  avg_rating_5?: number;
  avg_rating_6?: number;
  avg_sentiment?: number;
  grading_easy_pct?: number;
  grading_fair_pct?: number;
  grading_hard_pct?: number;
};

type Props = {
  professor: Professor;
  compact?: boolean;
};

const getSentimentIcon = (sentiment: number) => {
  if (sentiment > 0.2) {
    return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  }
  if (sentiment < -0.2) {
    return <TrendingDown className="w-4 h-4 text-rose-500" />;
  }
  return <Minus className="w-4 h-4 text-slate-400" />;
};

const getGradingColor = (easy = 0, fair = 0, hard = 0) => {
  if (easy >= 50) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (hard >= 50) return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
};

export default function ProfessorCard({ professor, compact = false }: Props) {
  const avgRating =
    ((professor.avg_rating_1 || 0) +
      (professor.avg_rating_2 || 0) +
      (professor.avg_rating_3 || 0) +
      (professor.avg_rating_4 || 0) +
      (professor.avg_rating_5 || 0) +
      (professor.avg_rating_6 || 0)) /
    6;

  const gradingLabel =
    (professor.grading_easy_pct || 0) >= 50
      ? 'آسان'
      : (professor.grading_hard_pct || 0) >= 50
      ? 'سخت‌گیر'
      : 'منصفانه';

  // مسیر پروفایل استاد در Next.js – اگر روت دیگری داری این را عوض کن
  const href = `/professor/${professor.id}`;

  return (
    <Link href={href}>
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white cursor-pointer overflow-hidden">
        <CardContent className={compact ? 'p-4' : 'p-6'}>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div
                className={`${
                  compact ? 'w-12 h-12' : 'w-16 h-16'
                } rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}
              >
                <User
                  className={`${
                    compact ? 'w-6 h-6' : 'w-8 h-8'
                  } text-white/90`}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                {getSentimentIcon(professor.avg_sentiment || 0)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`${
                    compact ? 'text-base' : 'text-lg'
                  } font-bold text-slate-800 truncate group-hover:text-slate-900`}
                >
                  {professor.name_standard}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                <BookOpen className="w-4 h-4" />
                <span>{professor.department?.replace(/_/g, ' ')}</span>
                <span className="text-slate-300">•</span>
                <span>{professor.review_count || 0} نظر</span>
              </div>

              {!compact && (
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className={`${getGradingColor(
                      professor.grading_easy_pct,
                      professor.grading_fair_pct,
                      professor.grading_hard_pct,
                    )} border`}
                  >
                    نمره‌دهی: {gradingLabel}
                  </Badge>
                  {professor.courses?.slice(0, 2).map((course, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-slate-50 text-slate-600 border-slate-200"
                    >
                      {course}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="text-center">
              <div
                className={`${
                  compact ? 'w-12 h-12' : 'w-14 h-14'
                } rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg`}
              >
                <span
                  className={`${
                    compact ? 'text-lg' : 'text-xl'
                  } font-bold text-white`}
                >
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i <= Math.round(avgRating / 2)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
