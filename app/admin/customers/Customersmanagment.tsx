"use client";

import { useState, useEffect } from "react";
import {
  Search, Loader2, User, ShoppingCart,
  Wallet, TrendingUp, Edit2, MoreVertical,
  Calendar, Package, Mail, ShieldCheck,
} from "lucide-react";
import {
  getAllCustomers,
  updateCustomer,
  updateCustomerRole,
  getCustomerOrders,
  getCustomerOverviewStats,
  type Customer,
} from "../customers/customeractions";

// ─── Rol Badge ────────────────────────────────────────────────────────────────

function RolBadge({ rol }: { rol: string }) {
  const config: Record<string, { label: string; color: string }> = {
    musteri:  { label: "Müşteri",  color: "bg-stone-100 text-stone-600" },
    vendor:   { label: "Satıcı",   color: "bg-blue-100 text-blue-700" },
    admin:    { label: "Admin",    color: "bg-red-100 text-red-700" },
  };
  const c = config[rol] || config.musteri;
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.color}`}>
      {c.label}
    </span>
  );
}

// ─── Customer Detail Modal ────────────────────────────────────────────────────

function CustomerDetailModal({ customer, onClose, onUpdated }: {
  customer: Customer;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [siparisler, setSiparisler] = useState<any[]>([]);
  const [loadingSiparisler, setLoadingSiparisler] = useState(true);
  const [editForm, setEditForm] = useState({
    ad: customer.ad, soyad: customer.soyad, telefon: customer.telefon || "",
  });
  const [saving, setSaving] = useState(false);
  const [rolDegistirme, setRolDegistirme] = useState(false);
  const [basari, setBasari] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    getCustomerOrders(customer.id).then(data => {
      setSiparisler(data);
      setLoadingSiparisler(false);
    });
  }, [customer.id]);

  async function handleKaydet(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setHata(null);
    const result = await updateCustomer(customer.id, editForm);
    setSaving(false);
    if (result.success) { setBasari("Kaydedildi."); onUpdated(); setTimeout(() => setBasari(null), 2000); }
    else setHata(result.error || "Hata");
  }

  async function handleRolDegistir(yeniRol: 'musteri' | 'vendor' | 'admin') {
    setRolDegistirme(true);
    const result = await updateCustomerRole(customer.id, yeniRol);
    setRolDegistirme(false);
    if (result.success) { setBasari(`Rol "${yeniRol}" olarak güncellendi.`); onUpdated(); setTimeout(() => setBasari(null), 2000); }
    else setHata(result.error || "Hata");
  }

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                <span className="text-white text-[15px] font-semibold">
                  {customer.ad?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-stone-900">
                  {customer.ad} {customer.soyad}
                </h2>
                <p className="text-[12px] text-stone-400">{customer.email || "—"}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors text-lg">×</button>
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* İstatistikler */}
            <div className="grid grid-cols-3 gap-3 p-6 border-b border-stone-100">
              <div className="bg-stone-50 rounded-xl p-3 text-center">
                <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-1">Sipariş</p>
                <p className="text-[20px] font-bold text-stone-900">{customer.toplam_siparis || 0}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 text-center">
                <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-1">Harcama</p>
                <p className="text-[16px] font-bold text-stone-900">₺{(customer.toplam_harcama || 0).toLocaleString('tr-TR')}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 text-center">
                <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-1">Rol</p>
                <RolBadge rol={customer.rol} />
              </div>
            </div>

            {/* Bilgi düzenleme */}
            <div className="p-6 border-b border-stone-100">
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Bilgileri Düzenle</h3>
              <form onSubmit={handleKaydet} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium mb-1 block">Ad</label>
                    <input type="text" value={editForm.ad}
                      onChange={e => setEditForm(p => ({ ...p, ad: e.target.value }))}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-stone-300" />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium mb-1 block">Soyad</label>
                    <input type="text" value={editForm.soyad}
                      onChange={e => setEditForm(p => ({ ...p, soyad: e.target.value }))}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-stone-300" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 font-medium mb-1 block">Telefon</label>
                  <input type="tel" value={editForm.telefon}
                    onChange={e => setEditForm(p => ({ ...p, telefon: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-stone-300" />
                </div>
                {hata && <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{hata}</p>}
                {basari && <p className="text-[12px] text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{basari}</p>}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-[13px] font-medium hover:bg-stone-700 transition-colors disabled:opacity-50">
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </form>
            </div>

            {/* Rol değiştirme */}
            <div className="p-6 border-b border-stone-100">
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Rol Yönetimi</h3>
              <div className="flex gap-2">
                {(['musteri', 'vendor', 'admin'] as const).map(rol => (
                  <button key={rol}
                    onClick={() => handleRolDegistir(rol)}
                    disabled={rolDegistirme || customer.rol === rol}
                    className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-all disabled:opacity-40
                      ${customer.rol === rol
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
                    {rol === 'musteri' ? 'Müşteri' : rol === 'vendor' ? 'Satıcı' : 'Admin'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-400 mt-2">Mevcut rol: <strong>{customer.rol}</strong></p>
            </div>

            {/* Sipariş geçmişi */}
            <div className="p-6">
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                Son Siparişler
              </h3>
              {loadingSiparisler ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-stone-400" size={20} />
                </div>
              ) : siparisler.length === 0 ? (
                <p className="text-[13px] text-stone-400 text-center py-6">Henüz sipariş yok</p>
              ) : (
                <div className="space-y-2">
                  {siparisler.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <div>
                        <p className="text-[13px] font-medium text-stone-800">#{s.id.toString().padStart(6, '0')}</p>
                        <p className="text-[11px] text-stone-400">
                          {new Date(s.created_at).toLocaleDateString('tr-TR')} · {s.siparis_detay?.length || 0} ürün
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-semibold text-stone-900">₺{parseFloat(s.toplam_fiyat).toLocaleString('tr-TR')}</p>
                        <span className="text-[10px] text-stone-400">{s.durum}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Customer Row ─────────────────────────────────────────────────────────────

function CustomerRow({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  const sonSiparisTarih = customer.son_siparis_tarihi
    ? new Date(customer.son_siparis_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const kayitTarihi = new Date(customer.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <tr onClick={onClick} className="border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-stone-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[13px] font-semibold">{customer.ad?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-[14px] font-medium text-stone-900 group-hover:text-stone-700">
              {customer.ad} {customer.soyad}
            </p>
            <p className="text-[12px] text-stone-400">{customer.email || customer.telefon || '—'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-[14px] font-semibold text-stone-900 tabular-nums">
          {customer.toplam_siparis || 0}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-[14px] font-semibold text-stone-900 tabular-nums">
          ₺{(customer.toplam_harcama || 0).toLocaleString('tr-TR')}
        </span>
      </td>
      <td className="px-4 py-4 text-[13px] text-stone-500">{sonSiparisTarih}</td>
      <td className="px-4 py-4 text-[13px] text-stone-500">{kayitTarihi}</td>
      <td className="px-4 py-4">
        <RolBadge rol={customer.rol} />
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [overviewStats, setOverviewStats] = useState({
    toplamMusteri: 0, yeniKayitlar: 0, aktifMusteri: 0, toplamHarcama: 0, ortalamaHarcama: 0,
  });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredCustomers(
      searchQuery
        ? customers.filter(c =>
            c.ad.toLowerCase().includes(query) ||
            c.soyad.toLowerCase().includes(query) ||
            c.telefon?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query)
          )
        : customers
    );
  }, [customers, searchQuery]);

  async function fetchData() {
    try {
      setLoading(true);
      const [customersData, statsData] = await Promise.all([
        getAllCustomers(),
        getCustomerOverviewStats(),
      ]);
      setCustomers(customersData);
      setOverviewStats(statsData);
    } catch (error) {
      console.error("Fetch customers error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <Loader2 className="animate-spin text-stone-400" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-['Crimson_Pro'] text-[32px] font-medium text-stone-900 mb-2">
            Müşteri Yönetimi
          </h1>
          <p className="text-[14px] text-stone-500">Tüm müşterileri görüntüleyin ve yönetin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: "Toplam Müşteri", value: overviewStats.toplamMusteri, icon: User, color: "stone" },
            { label: "Bu Ay Yeni", value: overviewStats.yeniKayitlar, icon: TrendingUp, color: "blue" },
            { label: "Aktif (30 gün)", value: overviewStats.aktifMusteri, icon: ShoppingCart, color: "green" },
            { label: "Toplam Harcama", value: `₺${overviewStats.toplamHarcama.toLocaleString('tr-TR')}`, icon: Wallet, color: "amber" },
            { label: "Ort. Harcama", value: `₺${overviewStats.ortalamaHarcama.toLocaleString('tr-TR')}`, icon: Package, color: "purple" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon size={14} className={`text-${color}-600`} />
                </div>
                <p className="text-[12px] text-stone-500">{label}</p>
              </div>
              <p className="text-[20px] font-semibold text-stone-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Arama */}
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 border border-stone-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-stone-300">
              <Search size={14} className="text-stone-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Ad, soyad, email veya telefon ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 py-2.5 text-[14px] focus:outline-none bg-transparent"
              />
            </div>
            <span className="text-[13px] text-stone-500">{filteredCustomers.length} müşteri</span>
          </div>
        </div>

        {/* Tablo */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  {["Müşteri", "Sipariş", "Harcama", "Son Sipariş", "Kayıt", "Rol"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <User size={40} className="mx-auto mb-3 text-stone-300" />
                      <p className="text-[14px] text-stone-500">
                        {searchQuery ? "Sonuç bulunamadı" : "Henüz müşteri yok"}
                      </p>
                    </td>
                  </tr>
                ) : filteredCustomers.map(customer => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onClick={() => setSelectedCustomer(customer)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdated={() => { fetchData(); setSelectedCustomer(null); }}
        />
      )}
    </div>
  );
}