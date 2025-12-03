// src/lib/i18n.ts - Tuần 9: Đa ngôn ngữ (vi/en)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'vi' | 'en';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    'common.login': 'Đăng nhập',
    'common.logout': 'Đăng xuất',
    'common.register': 'Đăng ký',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.create': 'Tạo mới',
    'common.search': 'Tìm kiếm',
    'common.loading': 'Đang tải...',
    'common.error': 'Đã xảy ra lỗi',
    'common.success': 'Thành công',
    'dashboard.title': 'Dashboard',
    'orders.title': 'Quản lý Đơn hàng',
    'orders.status.held': 'Đang ký quỹ',
    'orders.status.released': 'Đã giải phóng',
    'orders.status.refunded': 'Đã hoàn tiền',
    'orders.status.disputed': 'Tranh chấp',
    'orders.status.shipped': 'Đã giao hàng',
    'disputes.title': 'Giải quyết Tranh chấp',
    'audit.title': 'Lịch sử Hệ thống',
  },
  en: {
    'common.login': 'Login',
    'common.logout': 'Logout',
    'common.register': 'Register',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'dashboard.title': 'Dashboard',
    'orders.title': 'Order Management',
    'orders.status.held': 'Held',
    'orders.status.released': 'Released',
    'orders.status.refunded': 'Refunded',
    'orders.status.disputed': 'Disputed',
    'orders.status.shipped': 'Shipped',
    'disputes.title': 'Dispute Resolution',
    'audit.title': 'System History',
  },
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'vi',
      setLanguage: (lang) => set({ language: lang }),
      t: (key: string) => {
        const lang = get().language;
        return translations[lang][key as keyof typeof translations.vi] || key;
      },
    }),
    {
      name: 'i18n-storage',
    }
  )
);

