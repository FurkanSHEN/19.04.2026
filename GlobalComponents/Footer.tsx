// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F3] border-t border-stone-200 pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Marka Bilgisi */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="font-['Crimson_Pro'] text-xl tracking-widest uppercase mb-6 text-stone-900">Senzia</h2>
            <p className="text-stone-500 text-[14px] leading-relaxed">
              Minimalist estetiği üstün konforla buluşturan, zamansız yaşam alanları için tasarlanmış modüler mobilyalar.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-stone-900 mb-6">Müşteri Hizmetleri</h3>
            <ul className="space-y-4 text-[14px] text-stone-600">
              <li><Link href="/kargo" className="hover:text-stone-900 transition-colors">Teslimat Süreci (TR → EU)</Link></li>
              <li><Link href="/iade" className="hover:text-stone-900 transition-colors">İade ve Değişim</Link></li>
              <li><Link href="/sss" className="hover:text-stone-900 transition-colors">Sıkça Sorulan Sorular</Link></li>
              <li><Link href="/bakim" className="hover:text-stone-900 transition-colors">Kumaş Bakım Rehberi</Link></li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-stone-900 mb-6">Kurumsal</h3>
            <ul className="space-y-4 text-[14px] text-stone-600">
              <li><Link href="/vizyon" className="hover:text-stone-900 transition-colors">Vizyonumuz</Link></li>
              <li><Link href="/iletisim" className="hover:text-stone-900 transition-colors">Mağazalarımız</Link></li>
              <li><Link href="/sozlesme" className="hover:text-stone-900 transition-colors">Kullanım Koşulları</Link></li>
            </ul>
          </div>

          {/* Bülten */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-stone-900 mb-6">Bültene Katılın</h3>
            <p className="text-[13px] text-stone-500 mb-4">Yeni koleksiyonlardan ve özel davetlerden ilk siz haberdar olun.</p>
            <div className="flex border-b border-stone-400 pb-2">
              <input 
                type="email" 
                placeholder="E-posta adresiniz" 
                className="bg-transparent border-none outline-none text-[14px] w-full placeholder:text-stone-400"
              />
              <button className="text-[12px] uppercase font-medium text-stone-900 tracking-tighter">Kaydol</button>
            </div>
          </div>

        </div>

        {/* Alt Footer */}
        <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-stone-400">© 2024 Senzia Home. Tüm hakları saklıdır.</p>
          <div className="flex gap-6 grayscale opacity-60">
            {/* Buraya ödeme yöntemi ikonlarını veya sosyal medya linklerini ekleyebilirsin */}
            <span className="text-[11px] text-stone-400">Instagram</span>
            <span className="text-[11px] text-stone-400">Pinterest</span>
            <span className="text-[11px] text-stone-400">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}