export default function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">

      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>

        {action}
      </div>

      {children}

    </div>
  );
}
