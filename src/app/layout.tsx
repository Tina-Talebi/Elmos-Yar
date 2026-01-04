// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  GraduationCap, Search, Users, Sparkles, 
  Menu, Home, Database
} from 'lucide-react';
import Link from "next/link";

const NAV_ITEMS = [
  { name: '/', label: 'خانه', icon: Home },
  { name: '/search', label: 'جستجو', icon: Search },
  { name: '/compare', label: 'مقایسه', icon: Users },
  { name: '/recommend', label: 'پیشنهاد', icon: Sparkles },
];

export const metadata: Metadata = {
  title: "علموص‌یار",
  description: "داشبورد تحلیلی نظرات دانشجویان دانشگاه علم و صنعت ایران",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Vazirmatn', 'Inter', system-ui, sans-serif" }} className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800">علموص‌یار</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map(item => (
                  <Link key={item.name} href={item.name}>
                    <Button variant="ghost" className="gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Link href="/data-upload">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Database className="w-4 h-4" />
                  </Button>
                </Link>
              </nav>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-2 mt-8">
                    {NAV_ITEMS.map(item => (
                      <Link key={item.name} href={item.name}>
                        <Button variant="ghost" className="w-full justify-start gap-3">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                    <Link href="/data-upload">
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Database className="w-5 h-5" />
                        بارگذاری داده
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12 mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">علموص‌یار</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  سامانه هوشمند انتخاب استاد و درس بر اساس نظرات واقعی دانشجویان دانشگاه علم و صنعت ایران
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">دسترسی سریع</h3>
                <div className="flex flex-col gap-2">
                  {NAV_ITEMS.map(item => (
                    <Link 
                      key={item.name}
                      href={item.name}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-4">درباره پروژه</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  داده‌های این سامانه از کانال تلگرامی «اساتید علموص» جمع‌آوری شده و هدف آن کمک به دانشجویان در انتخاب واحد هوشمندانه است.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
              © ۱۴۰۴ علموص‌یار - تمامی حقوق محفوظ است
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}