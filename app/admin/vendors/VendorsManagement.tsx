"use client";

// Dosyanın en üstüne ekle
import { createPortal } from "react-dom";
import { useRef } from "react";
import { useState, useEffect } from "react";

import { 
  Search, Plus, Loader2, TrendingUp, Package, 
  ShoppingCart, Wallet, Edit2, Trash2, MoreVertical,
  CheckCircle2, XCircle
} from "lucide-react";
import {
  getAllVendors,
  toggleVendorStatus,
  deleteVendor,
  updateGuvenSkoru,
  updateVendor,        
  type Vendor,
  type VendorDurum,    
} from "./actions";
import VendorModal from "./VendorModal";

// ─── Sub Components ───────────────────────────────────────────────────────────

function VendorRow({ 
  vendor, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onUpdateScore 
}: {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: 'aktif' | 'pasif') => void;
  onUpdateScore: (id: number, score: number) => void;
}) {


   const [showActions, setShowActions] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [editingScore, setEditingScore] = useState(false);
  const [newScore, setNewScore] = useState(vendor.guven_skoru);

  const skorColor = vendor.guven_skoru >= 80 ? "text-green-600" :
                    vendor.guven_skoru >= 60 ? "text-amber-600" :
                    "text-red-600";


function handleMenuToggle() {
    if (!showActions && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 140, // 140 = dropdown genişliği
      });
    }
    setShowActions(prev => !prev);
  }

  function handleScoreSave() {
    if (newScore !== vendor.guven_skoru) {
      onUpdateScore(vendor.id, newScore);
    }
    setEditingScore(false);
  }

  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
      
      {/* Firma Bilgileri */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center
            flex-shrink-0">
            <span className="text-[14px] font-semibold text-stone-600">
              {vendor.ad.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-[14px] font-medium text-stone-900">{vendor.ad}</p>
            <p className="text-[12px] text-stone-500">{vendor.email}</p>
          </div>
        </div>
      </td>

      {/* Durum */}
      <td className="px-4 py-4">
        <select
          value={vendor.durum}
          onChange={(e) => onToggleStatus(vendor.id, e.target.value as VendorDurum)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border-0 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-stone-300 ${
            vendor.durum === 'aktif' ? "bg-green-100 text-green-700" :
            vendor.durum === 'pasif' ? "bg-stone-200 text-stone-600" :
            vendor.durum === 'incelemede' ? "bg-amber-100 text-amber-700" :
            vendor.durum === 'kisitli' ? "bg-red-100 text-red-700" :
            vendor.durum === 'tatil_modu' ? "bg-blue-100 text-blue-700" :
            "bg-stone-200 text-stone-600"
          }`}
        >
          <option value="aktif">Aktif</option>
          <option value="pasif">Pasif</option>
          <option value="incelemede">İncelemede</option>
          <option value="kisitli">Kısıtlı</option>
          <option value="tatil_modu">Tatil Modu</option>
          <option value="reddedildi">Reddedildi</option>
        </select>
      </td>

      {/* Güven Skoru */}
      <td className="px-4 py-4">
        {editingScore ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={newScore}
              onChange={(e) => setNewScore(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 border border-stone-300 rounded text-[13px] text-center"
              autoFocus
              onBlur={handleScoreSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScoreSave();
                if (e.key === 'Escape') {
                  setNewScore(vendor.guven_skoru);
                  setEditingScore(false);
                }
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setEditingScore(true)}
            className={`font-semibold tabular-nums ${skorColor} hover:underline`}
          >
            {vendor.guven_skoru}
          </button>
        )}
      </td>

      {/* İstatistikler */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-4 text-[13px]">
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-stone-400" />
            <span className="text-stone-700 font-medium">{vendor.urun_sayisi || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingCart size={14} className="text-stone-400" />
            <span className="text-stone-700 font-medium">{vendor.aktif_siparis || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wallet size={14} className="text-stone-400" />
            <span className="text-stone-700 font-medium">
              ₺{(vendor.toplam_kazanc || 0).toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </td>

      {/* Telefon */}
      <td className="px-4 py-4 text-[13px] text-stone-500">
        {vendor.telefon || "-"}
      </td>

      {/* Kayıt Tarihi */}
      <td className="px-4 py-4 text-[13px] text-stone-500">
        {new Date(vendor.created_at).toLocaleDateString('tr-TR')}
      </td>

      {/* Aksiyonlar */}
      <td className="px-4 py-4">
        <div>
          <button
            ref={buttonRef}
            onClick={handleMenuToggle}
            className="w-8 h-8 rounded-lg hover:bg-stone-200 flex items-center justify-center
              transition-colors"
          >
            <MoreVertical size={16} className="text-stone-500" />
          </button>

          {showActions && createPortal(
            <>
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => setShowActions(false)}
              />
              <div
                style={{ top: menuPos.top, left: menuPos.left }}
                className="absolute bg-white border border-stone-200 rounded-lg
                  shadow-lg py-1 min-w-[140px] z-[101]"
              >
                <button
                  onClick={() => { onEdit(vendor); setShowActions(false); }}
                  className="w-full px-4 py-2 text-left text-[13px] text-stone-700
                    hover:bg-stone-50 flex items-center gap-2"
                >
                  <Edit2 size={14} />
                  Düzenle
                </button>
                <button
                  onClick={() => {
                    if (confirm(`${vendor.ad} silinecek. Emin misiniz?`)) {
                      onDelete(vendor.id);
                    }
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-red-600
                    hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Sil
                </button>
              </div>
            </>,
            document.body
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VendorsManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'pasif'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // İlk yükleme
  useEffect(() => {
    fetchVendors();
  }, []);

  // Filtreleme
  useEffect(() => {
    let filtered = vendors;

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.durum === statusFilter);
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.ad.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query)
      );
    }

    setFilteredVendors(filtered);
  }, [vendors, statusFilter, searchQuery]);

  async function fetchVendors() {
    try {
      setLoading(true);
      const data = await getAllVendors();
      setVendors(data);
    } catch (error) {
      console.error("Fetch vendors error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(id: number, newStatus: VendorDurum) {
    const result = await updateVendor(id, { durum: newStatus });
    if (result.success) {
      fetchVendors();
    }
  }

  async function handleDelete(id: number) {
    const result = await deleteVendor(id);
    if (result.success) {
      fetchVendors();
    } else if (result.error) {
      alert(result.error);
    }
  }

  async function handleUpdateScore(id: number, newScore: number) {
    const result = await updateGuvenSkoru(id, newScore);
    if (result.success) {
      fetchVendors();
    }
  }

  function handleEdit(vendor: Vendor) {
    setEditingVendor(vendor);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingVendor(null);
  }

  function handleModalSuccess() {
    fetchVendors();
  }

  // Stats
  const stats = {
    toplam: vendors.length,
    aktif: vendors.filter(v => v.durum === 'aktif').length,
    pasif: vendors.filter(v => v.durum === 'pasif').length,
    ortalamaSkor: vendors.length > 0 
      ? Math.round(vendors.reduce((sum, v) => sum + v.guven_skoru, 0) / vendors.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Crimson_Pro'] text-[32px] font-medium text-stone-900 mb-2">
              Vendor Yönetimi
            </h1>
            <p className="text-[14px] text-stone-500">
              Tüm satıcıları yönetin ve takip edin
            </p>
          </div>
          <button
            onClick={() => {
              setEditingVendor(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg
              text-[14px] font-medium hover:bg-stone-700 transition-colors"
          >
            <Plus size={16} />
            Yeni Vendor Ekle
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-[12px] text-stone-500 mb-1">Toplam Vendor</p>
            <p className="text-[24px] font-semibold text-stone-900">{stats.toplam}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-[12px] text-stone-500 mb-1">Aktif</p>
            <p className="text-[24px] font-semibold text-green-600">{stats.aktif}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-[12px] text-stone-500 mb-1">Pasif</p>
            <p className="text-[24px] font-semibold text-stone-400">{stats.pasif}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-[12px] text-stone-500 mb-1">Ort. Güven Skoru</p>
            <p className="text-[24px] font-semibold text-amber-600">{stats.ortalamaSkor}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-4 flex-wrap">
            
            {/* Arama */}
            <div className="flex-1 min-w-[280px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Firma adı veya email ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                  focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              />
            </div>

            {/* Durum Filtresi */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  statusFilter === 'all'
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Tümü ({stats.toplam})
              </button>
              <button
                onClick={() => setStatusFilter('aktif')}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  statusFilter === 'aktif'
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                Aktif ({stats.aktif})
              </button>
              <button
                onClick={() => setStatusFilter('pasif')}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  statusFilter === 'pasif'
                    ? "bg-stone-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Pasif ({stats.pasif})
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-stone-600 
                    uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-stone-600 
                    uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-stone-600 
                    uppercase tracking-wider">
                    Güven Skoru
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-stone-600 
                    uppercase tracking-wider">
                    İstatistikler
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-stone-600 
                    uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-stone-600 
                    uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-stone-600 
                    uppercase tracking-wider">
                    Aksiyonlar
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="text-[14px] text-stone-500">
                        {searchQuery || statusFilter !== 'all' 
                          ? "Filtre kriterlerine uygun vendor bulunamadı" 
                          : "Henüz vendor eklenmemiş"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map(vendor => (
                    <VendorRow
                      key={vendor.id}
                      vendor={vendor}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      onUpdateScore={handleUpdateScore}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal */}
      <VendorModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingVendor={editingVendor}
      />
    </div>
  );
}