import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function StatExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pt-2 border-t border-stone-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition cursor-pointer"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        )}
        <span>Các chỉ số này nghĩa là gì?</span>
      </button>

      {open && (
        <div className="mt-2 space-y-2 text-[11px] text-stone-400 leading-relaxed">
          <p>
            <strong className="text-stone-200">Sức khỏe</strong> Ảnh hưởng đến tuổi thọ, sức bền và khả năng lao động, luyện võ. Giảm dần khi tuổi cao hoặc thiếu ăn.
          </p>
          <p>
            <strong className="text-stone-200">Hạnh phúc</strong> Mức độ an yên, hài lòng với cuộc sống. Gia cảnh, người thân, nếp sống và biến cố đều tác động lên chỉ số này.
          </p>
          <p>
            <strong className="text-stone-200">Học thức</strong> Quyết định cơ hội khoa cử, đỗ đạt và trọng dụng. Gia phong và điều kiện học tập ảnh hưởng lớn; trên mức 70 tăng chậm dần.
          </p>
          <p>
            <strong className="text-stone-200">Quan hệ</strong> Gắn bó với gia đình, bằng hữu và nhân mạch. Ảnh hưởng đến hôn nhân, sự nâng đỡ và chia sẻ gia sản.
          </p>
          <p className="text-[10px] text-stone-500 italic">
            Chỉ số cao giúp tăng xác suất thuận lợi, không quyết định tuyệt đối; từ ngưỡng 70 trở lên sẽ tăng chậm dần để giữ cân bằng tự nhiên.
          </p>
        </div>
      )}
    </div>
  );
}
