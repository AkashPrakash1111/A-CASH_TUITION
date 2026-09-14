import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import ToolNav from "../components/ai/ToolNav";
import ToolForm from "../components/ai/ToolForm";
import OutputPanel from "../components/ai/OutputPanel";
import HistoryStrip from "../components/ai/HistoryStrip";
import { AI_TOOLS } from "../components/ai/toolConfig";

import useAIStudio from "../hooks/useAIStudio";
import useBatches from "../hooks/useBatches";
import useSubjects from "../hooks/useSubjects";

export default function AIStudio() {
  const { generate, loading, error, setError, getHistory, clearHistory } = useAIStudio();

  const { batches } = useBatches();
  const { subjects } = useSubjects();

  const [activeToolId, setActiveToolId] = useState(AI_TOOLS[0].id);
  const [result, setResult] = useState(null);

  const activeTool = AI_TOOLS.find((t) => t.id === activeToolId);

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
    } catch {
      // error state is already surfaced by the hook
    }
  };

  return (
    <div className="p-8">

      <PageHeader
        title="AI Studio"
        subtitle="Generate question papers, notes, lesson plans and doubt answers with AI."
      />

      <div className="grid grid-cols-12 gap-8 -mt-4">

        {/* Left — Tool nav */}

        <div className="col-span-12 lg:col-span-3">
          <ToolNav
            tools={AI_TOOLS}
            activeTool={activeToolId}
            onSelect={selectTool}
          />
        </div>

        {/* Right — Form + output */}

        <div className="col-span-12 lg:col-span-9">

          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#008388]" />
            <h2 className="font-bold text-slate-800">
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

    </div>
  );
}
