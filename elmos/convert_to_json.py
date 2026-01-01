import pandas as pd
import os

# مسیر فایل CSV (در فولدر اصلی)
csv_file = 'reviews_sentiment_analysis.csv'

# چک کن فایل وجود داره
if not os.path.exists(csv_file):
    print(f"خطا: فایل {csv_file} پیدا نشد! مطمئن شو در فولدر اصلی پروژه کپی کردی.")
    exit()

# خواندن CSV
df = pd.read_csv(csv_file)

# ستون‌های ضروری (برای کاهش حجم و سرعت اپ)
columns = [
    'professor_id', 'professor_name_standard', 'department', 'course_name',
    'rating_1', 'rating_2', 'rating_3', 'rating_4', 'rating_5', 'rating_6',
    'grading_encoded', 'attendance_encoded', 'exam_encoded',
    'sentiment_score', 'sentiment_tag', 'comments', 'term'
]

# اگر ستونی نبود، حذف نشه (try-except ساده)
selected_columns = [col for col in columns if col in df.columns]
df = df[selected_columns]

# ساخت فولدر public/data اگر نبود
os.makedirs('public/data', exist_ok=True)

# ذخیره به JSON
output_file = 'public/data/reviews.json'
df.to_json(output_file, orient='records', force_ascii=False, indent=2)

print(f"موفقیت! {len(df)} نظر به {output_file} تبدیل شد.")
print("حالا می‌تونی پروژه Next.js رو بسازی و این JSON رو استفاده کنی.")