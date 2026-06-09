'use client';

// Admin paneli için hafif modal kabuğu. Esc + backdrop tıklaması ile kapanır.
// İçerik (form/aksiyon) children olarak verilir; başlık ve kapat butonu burada.
import { useEffect, type ReactNode } from 'react';
import Icon from '@/components/Icon';

export default function AdminModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="admin-modal-head">
          <h3 className="admin-modal-title">{title}</h3>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Kapat">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}
