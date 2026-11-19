import type React from 'react';
import type { FamilyLivingTier, LifestyleTier } from '../../types/activeLife';

export const TIER_DOTS: Record<FamilyLivingTier, number> = {
  tung_thieu: 1,
  du_an: 2,
  kha_gia: 3,
  sung_tuc: 4,
  hoang_gia: 5,
};

export const LIFESTYLE_OPTIONS: Array<{ value: LifestyleTier; label: string; desc: string }> = [
  { value: 'nhin_doi', label: 'Nhịn đói', desc: '0 gạo, 0đ (-1.8 SK, -1.2 HP/ngày)' },
  { value: 'chao_loang', label: 'Cháo loãng', desc: '0.5 đấu gạo/ngày (-0.04 SK, -0.05 HP)' },
  { value: 'com_rau', label: 'Cơm rau đạm bạc', desc: '1 đấu gạo + 5đ/ngày (Giữ thể lực)' },
  { value: 'thit_ca', label: 'Thịt cá đủ đầy', desc: '1.5 đấu gạo + 30đ/ngày (+5 SK, +7 HP/năm)' },
  { value: 'son_hao', label: 'Yến tiệc · Sơn hào', desc: '2 đấu gạo + 120đ/ngày (+9 SK, +12 HP, +5 Danh/năm)' },
];

export const PAUSE_MESSAGES: Record<string, string> = {
  birthday: 'Đã bước sang tuổi mới!',
  low_health: 'Cảnh báo: Sức khỏe xuống dưới 20%!',
  low_happiness: 'Cảnh báo: Tinh thần rơi vào U uất (< 20%)!',
  no_food: 'Cảnh báo: Cạn lương thực và hết tiền mua gạo!',
};

export function StatBar({
  label,
  value,
  icon,
  colorClass,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      onClick={onClick}
      className={`space-y-1 ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-stone-300 font-medium">
          {icon}
          {label}
        </span>
        <span className="font-mono text-stone-200">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
