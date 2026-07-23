"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createCustomer, updateCustomer, type CustomerFormData, type Customer } from "./customeractions";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCustomer?: Customer | null;
}

export default function CustomerModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingCustomer 
}: CustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    ad: "",
    soyad: "",
    telefon: "",
  });

  // Düzenleme modunda form'u doldur
  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        ad: editingCustomer.ad,
        soyad: editingCustomer.soyad,
        telefon: editingCustomer.telefon || "",
      });
    } else {
      // Yeni müşteri için reset
      setFormData({
        ad: "",
        soyad: "",
        telefon: "",
      });
    }
    setError(null);
  }, [editingCustomer, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (editingCustomer) {
        // Güncelleme
        result = await updateCustomer(editingCustomer.id, formData);
      } else {
        // Yeni ekleme
        result = await createCustomer(formData);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Bir hata oluştu");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 className="font-['Crimson_Pro'] text-[22px] font-medium text-stone-900">
            {editingCustomer ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center
              transition-colors"
          >
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Hata mesajı */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[13px] text-red-700">{error}</p>
            </div>
          )}

          {/* Ad */}
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-2">
              Ad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.ad}
              onChange={(e) => setFormData(prev => ({ ...prev, ad: e.target.value }))}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              placeholder="Örn: Ahmet"
            />
          </div>

          {/* Soyad */}
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-2">
              Soyad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.soyad}
              onChange={(e) => setFormData(prev => ({ ...prev, soyad: e.target.value }))}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              placeholder="Örn: Yılmaz"
            />
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.telefon}
              onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              placeholder="05XX XXX XX XX"
            />
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-[12px] text-blue-700 leading-relaxed">
              💡 Normal durumda müşteriler kayıt formundan otomatik eklenir. 
              Bu form manuel müşteri eklemek için kullanılır.
            </p>
          </div>

          {/* Butonlar */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 border border-stone-300 text-stone-700 rounded-lg
                text-[14px] font-medium hover:bg-stone-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-[14px]
                font-medium hover:bg-stone-700 transition-colors disabled:opacity-50
                disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Kaydediliyor..." : editingCustomer ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}