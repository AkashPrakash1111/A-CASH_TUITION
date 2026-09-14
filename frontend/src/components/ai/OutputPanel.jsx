import { Copy, Download, Settings2, AlertTriangle, Sparkles, Check } from "lucide-react";
import { useState } from "react";

export default function OutputPanel({ tool, loading, error, result }) {
  const [copied, setCopied] = useState(false);

  const isNotConfigured = error?.includes("isn't configured");

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result.content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${tool.id}-${Date.now()}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm mt-6 p-6 min-h-[280px] flex flex-col">

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF8F8] text-[#008388] flex items-center justify-center animate-pulse">
            <Sparkles size={24} />
          </div>
          <p className="mt-4 font-semibold text-slate-600">
            Generating with AI...
          </p>
          <p className="text-sm text-gray-400 mt-1">
            This usually takes a few seconds.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 max-w-md mx-auto">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isNotConfigured ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
          }`}>
            {isNotConfigured ? <Settings2 size={24} /> : <AlertTriangle size={24} />}
          </div>

          <p className="mt-4 font-semibold text-slate-700">
            {isNotConfigured ? "AI Studio isn't set up yet" : "Something went wrong"}
          </p>

          <p className="text-sm text-gray-400 mt-1.5">
            {error}
          </p>

          {isNotConfigured && (
            <p className="text-xs text-gray-400 mt-3 bg-slate-50 rounded-xl px-4 py-3">
              Add your key to <code className="font-mono">backend/.env</code> as{" "}
              <code className="font-mono">ANTHROPIC_API_KEY</code>, then restart
              the backend server.
            </p>
          )}
        </div>
      )}

      {!loading && !error && !result && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <p className="mt-4 font-semibold text-slate-500">
            Fill in the form and generate
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Your result will appear here.
          </p>
        </div>
      )}

      {!loading && !error && result && (
        <div className="flex-1 flex flex-col">

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400">
              Generated {result.createdAt}
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="h-9 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                onClick={handleDownload}
                className="h-9 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 flex-1 overflow-y-auto max-h-[500px]">
            {result.content}
          </div>

        </div>
      )}

    </div>
  );
}
