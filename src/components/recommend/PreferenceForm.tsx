import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, BookOpen, GraduationCap, Users, Clock, FileCheck } from 'lucide-react';

const PRIORITIES = [
  { key: 'priority_easy_grading', label: 'نمره‌دهی آسان', icon: GraduationCap, color: 'text-emerald-500' },
  { key: 'priority_teaching', label: 'کیفیت تدریس', icon: BookOpen, color: 'text-blue-500' },
  { key: 'priority_interaction', label: 'تعامل با دانشجو', icon: Users, color: 'text-purple-500' },
  { key: 'priority_free_attendance', label: 'حضور و غیاب آزاد', icon: Clock, color: 'text-amber-500' },
  { key: 'priority_light_exam', label: 'امتحان سبک', icon: FileCheck, color: 'text-rose-500' },
];

const DEPARTMENTS = [
  { value: 'all', label: 'همه دانشکده‌ها' },
  { value: 'برق', label: 'برق' },
  { value: 'مکانیک', label: 'مکانیک' },
  { value: 'مهندسی_کامپیوتر', label: 'مهندسی کامپیوتر' },
  { value: 'ریاضی', label: 'ریاضی' },
  { value: 'فیزیک', label: 'فیزیک' },
  { value: 'مهندسی_مواد', label: 'مهندسی مواد' },
  { value: 'معارف', label: 'معارف' },
  { value: 'معماری_و_شهرسازی', label: 'معماری و شهرسازی' },
];

export default function PreferenceForm({ onSubmit, loading }) {
  const [preferences, setPreferences] = useState({
    priority_easy_grading: 3,
    priority_teaching: 3,
    priority_interaction: 3,
    priority_free_attendance: 3,
    priority_light_exam: 3,
    department: 'all'
  });

  const handleSliderChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSubmit = () => {
    onSubmit(preferences);
  };

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-5 h-5 text-amber-500" />
          ترجیحات شما
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          اولویت‌های خود را مشخص کنید تا بهترین اساتید به شما پیشنهاد داده شوند
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Department */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">دانشکده مورد نظر</Label>
          <Select 
            value={preferences.department} 
            onValueChange={(v) => setPreferences(prev => ({ ...prev, department: v }))}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="انتخاب دانشکده" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Sliders */}
        {PRIORITIES.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </Label>
              <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">
                {preferences[key]}
              </span>
            </div>
            <Slider
              value={[preferences[key]]}
              onValueChange={(v) => handleSliderChange(key, v)}
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>کم اهمیت</span>
              <span>بسیار مهم</span>
            </div>
          </div>
        ))}

        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              در حال محاسبه...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              دریافت پیشنهادات
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}