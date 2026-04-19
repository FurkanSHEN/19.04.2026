import SellerProductUpload from "../vendors-dashboard-components/SellerProductUpload";
import VendorsSideBar from "../vendors-dashboard-components/VendorsSideBar";

// Eğer bu sayfaya özel bir metadata istersen ekleyebilirsin
export const metadata = {
  title: 'Yeni Ürün Ekle | Senzia Admin',
};

export default function AddProductPage() {
  return (

      <div className="min-h-screen bg-[#FAFAF8] flex p-6 gap-6">
          {/* Sol Menü */}
          <aside className="shrink-0">
            <VendorsSideBar />
          </aside>
        <main>
          <SellerProductUpload />
        </main>
      </div>
  );
}