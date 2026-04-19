import AdminProductApproval from "../approval/approval-components/AdminProductApproval";

export const metadata = {
  title: 'Ürün Onay Paneli | Senzia Admin',
};

export default function ApprovalPage() {
  return (
    <main>
      <AdminProductApproval />
    </main>
  );
}