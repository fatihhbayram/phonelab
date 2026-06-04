// Admin alanı düzeni — sadece admin'e özel stilleri yükler.
// Tema (data-theme) ve globals.css zaten kök layout'tan geliyor.
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
