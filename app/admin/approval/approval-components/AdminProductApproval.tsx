"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, X, Camera, FileText, Palette, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { updateProductStatus } from "../action";

type ProductStatus = "incelemede" | "yayinda" | "reddedildi";
type VetoKategori = "fotograf" | "aciklama" | "estetik" | "diger";

interface PendingProduct {
  id: number;
  ad: string;
  vendor_adi: string;
  fiyat: number;
  kategori: string;
  aciklama: string;
  durum: ProductStatus;
  created_at: string;
  ana_gorsel?: string;
  gorsel_set?: string[];
  urun_modulleri?: {
    id: number;
    modul_adi: string;  // ← Supabase'de 'modul_adi' görünüyor
    ekstra_fiyat: number;  // ← 'ekstra_fiyat' sütunu
    genislik: number;
    derinlik: number;
    yukseklik: number;
    aktif: boolean;
  }[];
}

const VETO_CATEGORIES: { id: VetoKategori; label: string; icon: any }[] = [
  { id: "fotograf", label: "Fotoğraf", icon: <Camera size={13} /> },
  { id: "aciklama", label: "Açıklama", icon: <FileText size={13} /> },
  { id: "estetik", label: "Estetik", icon: <Palette size={13} /> },
  { id: "diger", label: "Diğer", icon: <MoreHorizontal size={13} /> },
];

export default function AdminProductApproval({ products = [] }: { products: PendingProduct[] }) {
  const [localProducts, setLocalProducts] = useState(products);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [vetoKategori, setVetoKategori] = useState<VetoKategori>("fotograf");
  const [vetoMesaj, setVetoMesaj] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<PendingProduct | null>(null);
  // Modal açıkken body scroll'u kapat
  useEffect(() => {
    if (detailModalOpen || drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [detailModalOpen, drawerOpen]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!detailModalOpen) return;
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "Escape") closeModal();
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [detailModalOpen, currentImageIndex]); // currentImageIndex veya fonksiyonları bağımlılık olarak eklemeyi unutma

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    try {
      await updateProductStatus(id, "approve");
      setLocalProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Onaylanırken bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !vetoMesaj.trim()) return;
    setLoadingId(selectedProduct.id);
    try {
      await updateProductStatus(selectedProduct.id, "reject", { kategori: vetoKategori, mesaj: vetoMesaj });
      setLocalProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setDrawerOpen(false);
    } catch (err) {
      alert("Reddedilirken bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  };

const getAllImages = (product: any) => {
  const images: string[] = [];

  // 1. Ana görseli ekle
  if (product.ana_gorsel) {
    images.push(product.ana_gorsel);
  }

  // 2. gorsel_set array'inden görselleri ekle (Supabase'den gelen)
  if (product.gorsel_set && Array.isArray(product.gorsel_set)) {
    images.push(...product.gorsel_set);
  }

  // 3. urun_gorselleri tablosundan (varsa)
  if (product.urun_gorselleri && Array.isArray(product.urun_gorselleri)) {
    product.urun_gorselleri.forEach((img: any) => {
      if (img.gorsel_url) {
        images.push(img.gorsel_url);
      }
    });
  }

  console.log(`Ürün ${product.id} - Toplam görsel sayısı:`, images.length, images);
  return images;
};

  const openModal = (product: PendingProduct) => {
    setDetailProduct(product);
    setCurrentImageIndex(0);
    setDetailModalOpen(true);
  };

  const closeModal = () => {
    setDetailModalOpen(false);
    setDetailProduct(null);
  };

  const nextImage = () => {
    if (!detailProduct) return;
    const images = getAllImages(detailProduct);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!detailProduct) return;
    const images = getAllImages(detailProduct);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-6">
      {/* Grid Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {localProducts.map(p => (
          <div key={p.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div 
              className="h-72 bg-stone-100 cursor-pointer overflow-hidden group relative"
              onClick={() => openModal(p)}
            >
              {p.ana_gorsel ? (
                <img 
                  src={p.ana_gorsel} 
                  alt={p.ad} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl italic font-serif text-stone-300">
                  {p.ad.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            <div className="p-5">
              <h3 className="font-medium text-stone-900 mb-1">{p.ad}</h3>
              <p className="text-xs text-stone-400 mb-3">{p.vendor_adi}</p>
              <p className="text-sm text-stone-600 line-clamp-2 mb-4 h-10">{p.aciklama}</p>
              
              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(p.id);
                  }}
                  disabled={loadingId === p.id}
                  className="flex-1 bg-stone-900 text-white py-2.5 rounded-lg text-xs font-medium hover:bg-stone-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {loadingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Onayla
                </button>
                <button
                  onClick={(e) => { 
                    e.stopPropagation();
                    setSelectedProduct(p); 
                    setDrawerOpen(true); 
                  }}
                  className="flex-1 border border-stone-200 py-2.5 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                >
                  Reddet
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAY MODAL */}
      {detailModalOpen && detailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto mt-3 mb-3">
          <div className="min-h-screen px-6 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
            />

            {/* Modal İçerik */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
              
              {/* Kapatma Butonu */}
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/95 backdrop-blur  flex items-center justify-center bg-white shadow-xl transition-all hover:rotate-90 duration-300"
              >
                <X size={24} className="text-stone-900" />
              </button>

              <div className="grid lg:grid-cols-2 gap-0">
                
                {/* Sol Taraf - Görsel Carousel */}
                <div className="relative bg-stone-900 h-80 lg:h-[600px] m-4 overflow-hidden rounded-2xl group">
                  {(() => {
                    const images = getAllImages(detailProduct);
                    return images.length > 0 ? (
                      <>
                        <img 
                          key={currentImageIndex}
                          src={images[currentImageIndex]} 
                          alt={detailProduct.ad}
                          className="w-full h-full object-cover animate-in fade-in duration-500" 
                        />
                        
                        {images.length > 1 && (
                          <>
                            {/* Sol Ok */}
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                prevImage(); 
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white shadow-xl transition-all hover:scale-110"
                            >
                              <ChevronLeft size={24} className="text-stone-900" />
                            </button>
                            
                            {/* Sağ Ok */}
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                nextImage(); 
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white shadow-xl transition-all hover:scale-110"
                            >
                              <ChevronRight size={24} className="text-stone-900" />
                            </button>
                            
                            {/* Alt Noktalar */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                              {images.map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                                  className={`h-2 rounded-full transition-all ${
                                    i === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 w-2'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-8xl text-white/20 italic font-serif">
                        {detailProduct.ad.charAt(0)}
                      </div>
                    );
                  })()}
                </div>

                {/* Sağ Taraf - İçerik */}
                <div className="p-8 lg:p-10 overflow-y-auto h-[400px] lg:h-[600px]">
                  <div className="space-y-6">
                    
                    {/* Başlık */}
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-serif text-stone-900 mb-2 leading-tight">
                        {detailProduct.ad}
                      </h2>
                      <p className="text-stone-500">{detailProduct.vendor_adi}</p>
                    </div>

                    {/* Meta Bilgiler */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                        <p className="text-xs text-stone-500 mb-1">Kategori</p>
                        <p className="font-medium text-stone-900">{detailProduct.kategori}</p>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                        <p className="text-xs text-stone-500 mb-1">Başlangıç Fiyatı</p>
                        <p className="font-medium text-stone-900">{detailProduct.fiyat.toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </div>

                    {/* Açıklama */}
                    <div>
                      <h3 className="text-sm font-semibold text-stone-900 mb-2 uppercase tracking-wide">Açıklama</h3>
                      <p className="text-stone-600 leading-relaxed">{detailProduct.aciklama}</p>
                    </div>

                    {/* Ürün Modülleri Listesi */}
                {detailProduct.urun_modulleri && detailProduct.urun_modulleri.length > 0 ? (
                    <div className="mt-8 space-y-3">
                      <h3 className="text-stone-900 font-medium text-sm">Ürün Modülleri ({detailProduct.urun_modulleri.length})</h3>
                      {detailProduct.urun_modulleri.map((modul) => (
                        <div key={modul.id} className="flex justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                          <span className="text-stone-700">{modul.modul_adi}</span>
                          <span className="font-semibold">{Number(modul.ekstra_fiyat).toLocaleString('tr-TR')} ₺</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-8 text-stone-400 text-sm italic">Bu ürüne ait modül bulunamadı.</p>
                  )}

                    {/* Aksiyon Butonları */}
                    <div className="pt-6 space-y-3 border-t border-stone-100">
                      <button
                        onClick={() => {
                          handleApprove(detailProduct.id);
                          closeModal();
                        }}
                        disabled={loadingId === detailProduct.id}
                        className="w-full bg-stone-900 text-white py-4 rounded-xl font-semibold hover:bg-stone-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                      >
                        {loadingId === detailProduct.id ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Check size={20} />
                        )}
                        Ürünü Onayla ve Yayınla
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(detailProduct);
                          closeModal();
                          setDrawerOpen(true);
                        }}
                        className="w-full border-2 border-stone-200 py-4 rounded-xl font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                      >
                        Reddet ve Geri Bildir
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* RED ÇEKMECESİ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setDrawerOpen(false)} 
          />
          <div className="relative bg-white w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-serif mb-2 text-stone-900">Ürünü Reddet</h2>
            <p className="text-sm text-stone-500 mb-6">{selectedProduct?.ad}</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {VETO_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setVetoKategori(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                      vetoKategori === cat.id 
                        ? 'border-stone-900 bg-stone-900 text-white' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full p-4 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none h-32 resize-none"
                placeholder="Red nedenini detaylı açıklayın..."
                value={vetoMesaj}
                onChange={(e) => setVetoMesaj(e.target.value)}
              />
              <button
                onClick={handleReject}
                disabled={!vetoMesaj.trim() || loadingId === selectedProduct?.id}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loadingId === selectedProduct?.id ? (
                  <Loader2 size={18} className="animate-spin inline" />
                ) : (
                  "Red Bildirimini Gönder"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}