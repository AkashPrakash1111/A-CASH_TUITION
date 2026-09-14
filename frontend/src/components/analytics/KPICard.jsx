export default function KPICard({ icon: Icon, label, value, sublabel, color }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">

      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={22} />
        </div>

        <div className="min-w-0">
          <p className="text-2xl font-bold text-slate-800 leading-none">
            {value}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">{label}</p>
        </div>
      </div>

      {sublabel && (
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-slate-100">
          {sublabel}
        </p>
      )}

    </div>
  );
}
