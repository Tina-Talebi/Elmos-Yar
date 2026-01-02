import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, BookOpen, MessageSquare } from 'lucide-react';
import SentimentBadge from './SentimentBadge';
import { format } from 'date-fns';

export default function ReviewCard({ review }) {
  const avgRating = (
    (review.rating_1 || 0) +
    (review.rating_2 || 0) +
    (review.rating_3 || 0) +
    (review.rating_4 || 0) +
    (review.rating_5 || 0) +
    (review.rating_6 || 0)
  ) / 6;

  return (
    <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">{review.course_name}</span>
              </div>
              {review.term && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{review.term}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-bold text-amber-700">{avgRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Comment */}
        {review.comments && (
          <p className="text-slate-600 leading-relaxed mb-4 text-sm">
            {review.comments}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <SentimentBadge tag={review.sentiment_tag} score={review.sentiment_score} />
          
          {review.grading_encoded && (
            <Badge variant="outline" className={`
              ${review.grading_encoded === 'آسان' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                review.grading_encoded === 'سخت‌گیر' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                'bg-amber-50 text-amber-700 border-amber-200'}
            `}>
              نمره‌دهی: {review.grading_encoded}
            </Badge>
          )}

          {review.attendance_encoded && (
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
              {review.attendance_encoded}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}