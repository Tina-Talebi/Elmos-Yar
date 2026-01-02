import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export default function SentimentBadge({ tag, score, showScore = false }) {
  const config = {
    positive: {
      icon: ThumbsUp,
      label: 'مثبت',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
    },
    negative: {
      icon: ThumbsDown,
      label: 'منفی',
      className: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100'
    },
    neutral: {
      icon: Minus,
      label: 'خنثی',
      className: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  };

  const { icon: Icon, label, className } = config[tag] || config.neutral;

  return (
    <Badge variant="outline" className={`${className} border gap-1.5`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-xs opacity-70">
          ({score > 0 ? '+' : ''}{score.toFixed(2)})
        </span>
      )}
    </Badge>
  );
}