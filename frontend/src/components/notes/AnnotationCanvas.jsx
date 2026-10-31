import { useRef, useState, useEffect } from "react";
import {
  Pen,
  Highlighter,
  Square,
  Circle,
  MoveRight,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Save,
  X,
  Palette,
  Check,
} from "lucide-react";
import { notesApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const COLORS = [
  { name: "Black", value: "#0f172a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Teal", value: "#008388" },
  { name: "Emerald", value: "#059669" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#e11d48" },
  { name: "Purple", value: "#7c3aed" },
];

const STROKE_WIDTHS = [
  { label: "Fine", value: 2 },
  { label: "Medium", value: 5 },
  { label: "Bold", value: 10 },
];

export default function AnnotationCanvas({
  note,
  isOpen,
  onClose,
  initialBackgroundImage = null,
}) {
  const { token, user } = useAuth();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [activeTool, setActiveTool] = useState("pen"); // pen | highlighter | rect | circle | arrow | text | eraser
  const [activeColor, setActiveColor] = useState("#2563eb");
  const [activeWidth, setActiveWidth] = useState(5);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState(null);

  // Undo/Redo stack
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Initialize Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set high resolution size
    canvas.width = 900;
    canvas.height = 600;

    // Fill white or draw background image
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If initial image exists, draw it
    if (initialBackgroundImage || note?.file_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = initialBackgroundImage || note?.file_url;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveCanvasState();
      };
      img.onerror = () => {
        saveCanvasState();
      };
    } else {
      saveCanvasState();
    }

    // Load existing annotations if note exists
    if (note?.id && token) {
      notesApi.listAnnotations(token, note.id)
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            const latest = res[res.length - 1];
            if (latest?.canvas_data) {
              const annImg = new Image();
              annImg.src = latest.canvas_data;
              annImg.onload = () => {
                ctx.drawImage(annImg, 0, 0);
                saveCanvasState();
              };
            }
          }
        })
        .catch((err) => console.error("Could not load annotations", err));
    }
  }, [isOpen, note, initialBackgroundImage, token]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(dataUrl);
      return next;
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreCanvasState(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreCanvasState(history[newIndex]);
    }
  };

  const restoreCanvasState = (dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas || !dataUrl) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    if (window.confirm("Clear all annotations on this canvas?")) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveCanvasState();
    }
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    const coords = getCanvasCoords(e);
    setStartPoint(coords);

    if (activeTool === "text") {
      setTextPos(coords);
      return;
    }

    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const coords = getCanvasCoords(e);

    ctx.lineWidth = activeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (activeTool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = activeWidth * 3;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (activeTool === "highlighter") {
      ctx.strokeStyle = activeColor;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = activeWidth * 4;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (activeTool === "pen") {
      ctx.strokeStyle = activeColor;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (["rect", "circle", "arrow"].includes(activeTool)) {
      // For shapes, restore previous state then draw preview shape
      if (historyIndex >= 0 && history[historyIndex]) {
        restoreCanvasState(history[historyIndex]);
      }
      setTimeout(() => {
        ctx.lineWidth = activeWidth;
        ctx.strokeStyle = activeColor;
        if (activeTool === "rect") {
          ctx.strokeRect(startPoint.x, startPoint.y, coords.x - startPoint.x, coords.y - startPoint.y);
        } else if (activeTool === "circle") {
          const radius = Math.sqrt(
            Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2)
          );
          ctx.beginPath();
          ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (activeTool === "arrow") {
          drawArrow(ctx, startPoint.x, startPoint.y, coords.x, coords.y);
        }
      }, 0);
    }
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasState();
  };

  const drawArrow = (ctx, fromx, fromy, tox, toy) => {
    const headlen = 16;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(tox, toy);
    ctx.fillStyle = activeColor;
    ctx.fill();
  };

  const handleAddText = () => {
    if (!textInput.trim() || !textPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${activeWidth * 4 + 14}px sans-serif`;
    ctx.fillStyle = activeColor;
    ctx.fillText(textInput, textPos.x, textPos.y);
    saveCanvasState();
    setTextInput("");
    setTextPos(null);
  };

  const handleSaveToBackend = async () => {
    if (!note?.id || !token) {
      alert("Please ensure you are connected to save annotations to the cloud.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      await notesApi.saveAnnotations(token, note.id, {
        canvas_data: dataUrl,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      alert(`Could not save annotation: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${note?.title || "study-notes"}-annotated.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header & Studio Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#008388]">
                Annotation Studio
              </span>
              <h3 className="font-extrabold text-slate-800 text-lg line-clamp-1">
                {note?.title || "Interactive Whiteboard Canvas"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Highlight key concepts, sketch diagrams, or take whiteboard notes over this document.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToBackend}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow transition disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : saveStatus === "saved" ? "Saved! ✨" : "Save Notes"}
            </button>

            <button
              onClick={handleDownload}
              title="Download annotated image"
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition"
            >
              <Download size={14} /> Download
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar Strip */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tool Selectors */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTool("pen")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTool === "pen" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Pen size={14} /> Pen
            </button>
            <button
              onClick={() => setActiveTool("highlighter")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTool === "highlighter" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Highlighter size={14} /> Highlight
            </button>
            <button
              onClick={() => setActiveTool("rect")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTool === "rect" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Square size={14} /> Box
            </button>
            <button
              onClick={() => setActiveTool("circle")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTool === "circle" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Circle size={14} /> Circle
            </button>
            <button
              onClick={() => setActiveTool("arrow")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTool === "arrow" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MoveRight size={14} /> Arrow
            </button>
            <button
              onClick={() => setActiveTool("text")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTool === "text" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Type size={14} /> Text
            </button>
            <button
              onClick={() => setActiveTool("eraser")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTool === "eraser" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Eraser size={14} /> Eraser
            </button>
          </div>

          {/* Colors & Widths */}
          <div className="flex items-center gap-4">
            {/* Palette */}
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setActiveColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                    activeColor === c.value ? "ring-2 ring-offset-2 ring-cyan-500 scale-110" : "hover:scale-105"
                  }`}
                >
                  {activeColor === c.value && <Check size={12} className="text-white drop-shadow" />}
                </button>
              ))}
            </div>

            {/* Thickness */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {STROKE_WIDTHS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setActiveWidth(w.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    activeWidth === w.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {/* Undo / Redo / Clear */}
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Undo"
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo"
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <Redo2 size={16} />
              </button>
              <button
                onClick={clearCanvas}
                title="Clear Canvas"
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 ml-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Body */}
        <div
          ref={containerRef}
          className="flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center relative min-h-[480px]"
        >
          <div className="relative shadow-xl rounded-2xl overflow-hidden bg-white border border-slate-200">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              className="cursor-crosshair block max-w-full h-auto"
            />

            {/* Text Floating Modal when text tool clicked on canvas */}
            {textPos && (
              <div
                className="absolute z-20 bg-white p-3 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-2"
                style={{
                  left: `${(textPos.x / 900) * 100}%`,
                  top: `${(textPos.y / 600) * 100}%`,
                }}
              >
                <input
                  type="text"
                  autoFocus
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddText();
                    if (e.key === "Escape") setTextPos(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleAddText}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-semibold text-xs hover:bg-cyan-700"
                >
                  Place
                </button>
                <button
                  onClick={() => setTextPos(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
