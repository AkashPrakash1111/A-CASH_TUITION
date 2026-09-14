export default function ToolNav({ tools, activeTool, onSelect }) {
  return (
    <div className="space-y-3">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const active = activeTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => onSelect(tool.id)}
            className={`
              w-full text-left rounded-[24px] p-4 flex items-start gap-3.5 border transition
              ${
                active
                  ? "bg-white border-[#008388] shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }
            `}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tool.color}`}>
              <Icon size={20} />
            </div>

            <div className="min-w-0">
              <p className={`font-bold text-sm ${active ? "text-[#008388]" : "text-slate-800"}`}>
                {tool.label}
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-snug">
                {tool.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
