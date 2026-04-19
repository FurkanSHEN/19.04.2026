import Image from "next/image";
import Header from "@/GlobalComponents/Header";
import Footer from "@/GlobalComponents/Footer";

export default function Home() {
  return (
    // Fragment kullanarak Header, Main ve Footer'ı sarmalıyoruz
    <>
      <Header />
      
      <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 mx-auto bg-white dark:bg-black sm:items-start">
          <Image
            className="dark:invert mb-10"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="font-['Crimson_Pro'] text-4xl font-medium tracking-tight text-stone-900 dark:text-zinc-50">
              Senzia Home
            </h1>
            <p className="max-w-md text-lg leading-8 text-stone-600 dark:text-zinc-400">
              Minimalist estetik ve modüler tasarımın buluştuğu nokta.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-12 sm:flex-row">
            <a
              className="flex h-12 items-center justify-center rounded-full bg-stone-900 px-8 text-white transition-all hover:bg-stone-700"
              href="/urun" // image_09d683.png'deki klasör yapına uygun yol
            >
              Koleksiyonları Keşfet
            </a>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}