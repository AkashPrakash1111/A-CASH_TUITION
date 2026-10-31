import { useMemo, useState, useEffect } from "react";
import { Sparkles, Info, BookOpen, Key, CheckCircle2, Copy } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import ToolNav from "../components/ai/ToolNav";
import ToolForm from "../components/ai/ToolForm";
import OutputPanel from "../components/ai/OutputPanel";
import HistoryStrip from "../components/ai/HistoryStrip";
import { AI_TOOLS } from "../components/ai/toolConfig";

import useAIStudio from "../hooks/useAIStudio";
import useBatches from "../hooks/useBatches";
import useSubjects from "../hooks/useSubjects";
import { useAuth } from "../hooks/useAuth";
import { aiApi } from "../services/api";

export default function AIStudio() {
  const { token } = useAuth();
  const { generate, loading, error, setError, getHistory, clearHistory } = useAIStudio();

  const { batches } = useBatches();
  const { subjects } = useSubjects();

  const [activeToolId, setActiveToolId] = useState(AI_TOOLS[0].id);
  const [result, setResult] = useState(null);

  // 3-Tier AI System Status
  const [aiStatus, setAiStatus] = useState({ configured: false, provider: "Checking...", model: "" });
  const [templates, setTemplates] = useState({});
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  const activeTool = AI_TOOLS.find((t) => t.id === activeToolId);

  useEffect(() => {
    async function loadStatusAndTemplates() {
      try {
        const [st, tmpl] = await Promise.allSettled([
          aiApi.getStatus(token),
          aiApi.getTemplates(token),
        ]);
        if (st.status === "fulfilled" && st.value) setAiStatus(st.value);
        if (tmpl.status === "fulfilled" && tmpl.value) setTemplates(tmpl.value);
      } catch (e) {
        console.warn("Could not check AI status", e);
      }
    }
    loadStatusAndTemplates();
  }, [token]);

  const classList = useMemo(() => {
    return [...new Set(batches.map((b) => b.className).filter(Boolean))].sort();
  }, [batches]);

  const subjectList = useMemo(() => {
    return subjects.map((s) => s.name);
  }, [subjects]);

  const history = getHistory(activeToolId);

  const selectTool = (toolId) => {
    setActiveToolId(toolId);
    setResult(null);
    setError(null);
  };

  const handleGenerate = async (inputs) => {
    setResult(null);
    try {
      const entry = await generate(activeToolId, inputs);
      setResult(entry);
    } catch (err) {
      // If unconfigured or failed, offer template selection
      console.warn("Generation failed", err);
    }
  };

  const handleUseTemplate = (content, title) => {
    setResult({
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toLocaleString(),
      inputs: { template: title },
    });
    setShowTemplatesModal(false);
    setError(null);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="AI Studio & Curriculum Lab"
          subtitle="Generate question papers, notes, lesson plans and doubt answers with AI."
        />

        <button
          onClick={() => setShowTemplatesModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition"
        >
          <BookOpen size={16} className="text-[#008388]" />
          Browse Syllabus Templates ({Object.keys(templates).length})
        </button>
      </div>

      {/* Honest 3-Tier AI Status Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
          aiStatus.configured
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                aiStatus.configured ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                aiStatus.configured ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>

          <div>
            <p className="font-bold">
              {aiStatus.configured
                ? `Active: ${aiStatus.provider} (${aiStatus.model})`
                : "Anthropic Claude API Key Unconfigured — Curriculum Templates Fallback Active"}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {aiStatus.configured
                ? "Live multimodal Claude intelligence is ready for paper setting, concept summaries, and lesson plans."
                : "No fake AI: to activate live generation, add ANTHROPIC_API_KEY to backend/.env. Built-in curriculum templates remain fully accessible."}
            </p>
          </div>
        </div>

        {!aiStatus.configured && (
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 font-bold text-amber-900 text-xs shrink-0 transition"
          >
            Use Template
          </button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left — Tool nav */}
        <div className="col-span-12 lg:col-span-3">
          <ToolNav
            tools={AI_TOOLS}
            activeTool={activeToolId}
            onSelect={selectTool}
          />
        </div>

        {/* Right — Form + output */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#008388]" />
            <h2 className="font-bold text-slate-800 text-base">
              {activeTool.label}
            </h2>
          </div>

          <ToolForm
            tool={activeTool}
            classes={classList}
            subjects={subjectList}
            onGenerate={handleGenerate}
            loading={loading}
          />

          <OutputPanel
            tool={activeTool}
            loading={loading}
            error={error}
            result={result}
          />

          <HistoryStrip
            history={history}
            onSelect={setResult}
            onClear={() => clearHistory(activeToolId)}
          />
        </div>
      </div>

      {/* Curriculum Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Curriculum Blueprint Library</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-authored academic templates for exams, rapid notes, and lesson plans.
                </p>
              </div>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {Object.entries(templates).map(([subj, categories]) => (
                <div key={subj} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#008388]">
                    {subj}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    {Object.entries(categories).map(([catName, text]) => (
                      <button
                        key={catName}
                        onClick={() => handleUseTemplate(text, `${subj} — ${catName}`)}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-cyan-500 text-left hover:shadow-sm transition"
                      >
                        <p className="font-bold text-xs text-slate-800">{catName}</p>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
