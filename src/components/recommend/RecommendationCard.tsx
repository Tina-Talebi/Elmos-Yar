import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, ChevronLeft, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecommendationCard({ professor, rank, explanation }) {
  const avgRating = (
    (professor.avg_rating_1 || 0) +
    (professor.avg_rating_2 || 0) +
    (professor.avg_rating_3 || 0) +
    (professor.avg_rating_4 || 0) +
    (professor.avg_rating_5 || 0) +
    (professor.avg_rating_6 || 0)
  ) / 6;

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex">
          {/* Rank Badge */}
          <div className="w-16 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
            <span className="text-3xl font-bold text-white/90">#{rank}</span>
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{professor.name_standard}</h3>
                  <p className="text-sm text-slate-500">{professor.department?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-xl">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-xl font-bold text-amber-700">{avgRating.toFixed(1)}</span>
              </div>
            </div>

            {/* Explanation */}
            {explanation && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{explanation}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {professor.grading_easy_pct >= 50 && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  نمره‌دهی آسان
                </Badge>
              )}
              {professor.avg_sentiment > 0.3 && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  نظرات مثبت
                </Badge>
              )}
              {professor.review_count > 10 && (
                <Badge variant="outline" className="bg-slate-50">
                  {professor.review_count} نظر
                </Badge>
              )}
              {professor.courses?.slice(0, 2).map((course, i) => (
                <Badge key={i} variant="outline" className="bg-slate-50">
                  {course}
                </Badge>
              ))}
            </div>

            {/* Action */}
            <Link to={createPageUrl('ProfessorProfile') + `?id=${professor.id}`}>
              <Button variant="ghost" className="group-hover:bg-slate-100 p-0 h-auto text-slate-600 hover:text-slate-800">
                مشاهده پروفایل کامل
                <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}