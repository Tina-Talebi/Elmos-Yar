import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function FilterPanel({ filters, onFilterChange }) {
    const departments = [
        'برق',
        'مکانیک',
        'مهندسی_کامپیوتر',
        'ریاضی',
        'فیزیک',
        'مهندسی_مواد',
        'معارف',
        'معماری_و_شهرسازی',
        'شیمی',
        'صنایع',
        'عمران'
    ];

    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
                <Label>دانشکده</Label>
                <Select value={filters.department || 'all'} onValueChange={(v) => handleChange('department', v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="همه دانشکده‌ها" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">همه دانشکده‌ها</SelectItem>
                        {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>
                                {dept.replace(/_/g, ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>حداقل امتیاز</Label>
                <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.minRating || ''}
                    onChange={(e) => handleChange('minRating', parseFloat(e.target.value) || 0)}
                    placeholder="0 - 10"
                />
            </div>

            <div className="space-y-2">
                <Label>نوع نمره‌دهی</Label>
                <Select value={filters.grading || 'all'} onValueChange={(v) => handleChange('grading', v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="همه انواع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">همه انواع</SelectItem>
                        <SelectItem value="آسان">آسان</SelectItem>
                        <SelectItem value="منصفانه">منصفانه</SelectItem>
                        <SelectItem value="سخت‌گیر">سخت‌گیر</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>حداقل تعداد نظرات</Label>
                <Input
                    type="number"
                    min="0"
                    value={filters.minReviews || ''}
                    onChange={(e) => handleChange('minReviews', parseInt(e.target.value) || 0)}
                    placeholder="حداقل 5"
                />
            </div>
        </div>
    );
}