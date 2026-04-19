// components/Header.tsx
"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-100">
      <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Sol Menü (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-stone-600 uppercase tracking-widest">
          <Link href="/koleksiyonlar" className="hover:text-stone-900 transition-colors">Koleksiyonlar</Link>
          <Link href="/oturma-odasi" className="hover:text-stone-900 transition-colors">Oturma Odası</Link>
          <Link href="/hakkimizda" className="hover:text-stone-900 transition-colors">Hikayemiz</Link>
        </nav>

        {/* Mobil Menü İkonu */}
        <button className="md:hidden text-stone-800">
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-['Crimson_Pro'] text-2xl tracking-[0.2em] font-light text-stone-900 uppercase">
            Senzia
          </h1>
        </Link>

        {/* Sağ İkonlar */}
        <div className="flex items-center gap-5 text-stone-700">
          <button className="hover:text-stone-900 transition-all"><Search size={19} strokeWidth={1.5} /></button>
          <button className="hover:text-stone-900 transition-all"><User size={19} strokeWidth={1.5} /></button>
          <button className="relative hover:text-stone-900 transition-all">
            <ShoppingBag size={19} strokeWidth={1.5} />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-stone-900 text-white text-[10px] flex items-center justify-center rounded-full">0</span>
          </button>
        </div>

      </div>
    </header>
  );
}