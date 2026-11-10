import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, FileText, Music, Mic, Square, X, Paperclip, Camera } from "lucide-react";
import { filesApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_SECONDS = 10 * 60;

const IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const AUDIO_MIMES = new Set([
  "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
  "audio/wave", "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/aac",
]);

function kindOfMime(mime) {
  const m = (mime || "").split(";")[0].toLowerCase();
  if (IMAGE_MIMES.has(m)) return "image";
  if (m === "application/pdf") return "pdf";
  if (AUDIO_MIMES.has(m)) return "audio";
  return null;
}

const readAsDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("That file couldn't be read"));
    reader.readAsDataURL(blob);
  });

const MAX_SIDE = 1800; // longest edge of a photo after compression
const JPEG_QUALITY = 0.82;

/**
 * Shrink a photo before it is sent: phone cameras give 3-8 MB images, and a
 * dozen of them would fill the free database. Returns {blob, name}.
 * Falls back to the original if the browser can't decode it.
 */
async function compressImage(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode"));
      el.src = objectUrl;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // PNG transparency would turn black in a JPEG
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob) throw new Error("encode");
    // Keep the original when it was already smaller and untouched
    if (scale === 1 && file.type === "image/jpeg" && file.size <= blob.size) return { blob: file, name: file.name };
    const base = (file.name || "photo").replace(/\.[^.]+$/, "");
    return { blob, name: `${base}.jpg` };
  } catch {
    if (IMAGE_MIMES.has((file.type || "").toLowerCase())) return { blob: file, name: file.name };
    throw new Error(`"${file.name}" couldn't be opened as a photo.`);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

let counter = 0;
const uid = () => `new-${Date.now()}-${counter++}`;

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Add photos, PDFs and audio (uploaded or recorded in the browser) to an answer
 * or an assignment.
 *
 * `value` is the list of {id, name, type, url}. `onChange` MUST be a React
 * state setter: it is called with a function, `onChange(prev => next)`.
 * Items whose url already starts with /files/ are files that were saved
 * earlier and are simply kept.
 */
export default function AttachmentPicker({ value = [], onChange, max = 40, disabled = false }) {
  const { token } = useAuth();
  const imageInput = useRef(null);
  const cameraInput = useRef(null);
  const pdfInput = useRef(null);
  const audioInput = useRef(null);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const full = value.length >= max;

  const append = (items) => onChange((prev) => [...prev, ...items].slice(0, max));

  const handleFiles = async (e, expected) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setError("");
    setBusy(true);

    if (value.length + files.length > max) {
      setError(`You can attach up to ${max} files.`);
      setBusy(false);
      return;
    }

    try {
      const items = [];
      for (const file of files) {
        const kind = expected === "image" && (file.type || "").startsWith("image/") ? "image" : kindOfMime(file.type);
        if (!kind || kind !== expected) {
          const what = expected === "image" ? "a JPG, PNG or WEBP photo" : expected === "pdf" ? "a PDF" : "an audio file (MP3, WAV, M4A, OGG)";
          setError(`"${file.name}" isn't ${what}.`);
          return;
        }
        let blob = file;
        let name = file.name;
        if (kind === "image") ({ blob, name } = await compressImage(file));
        if (blob.size > MAX_BYTES) {
          setError(`"${file.name}" is larger than 25 MB.`);
          return;
        }
        items.push({ id: uid(), name, type: kind, url: await readAsDataUrl(blob), size: blob.size });
      }
      append(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Recording isn't supported in this browser. Upload an audio file instead.");
      return;
    }
    if (full) {
      setError(`You can attach up to ${max} files.`);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find(
        (t) => MediaRecorder.isTypeSupported(t)
      );
      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        clearInterval(timerRef.current);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);

        const type = recorder.mimeType || preferred || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size === 0) return;
        if (blob.size > MAX_BYTES) {
          setError("That recording is too long (over 25 MB).");
          return;
        }

        try {
          const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
          append([{ id: uid(), name: `Voice recording.${ext}`, type: "audio", url: await readAsDataUrl(blob), size: blob.size }]);
        } catch (err) {
          setError(err.message);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      setError(
        err?.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow the microphone for this site, then try again."
          : "Couldn't start the microphone. Check that one is connected."
      );
    }
  };

  // Stop automatically at the time limit
  useEffect(() => {
    if (recording && seconds >= MAX_SECONDS) stopRecording();
  }, [recording, seconds]);

  // Never leave the microphone on if the screen closes mid-recording
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      const recorder = recorderRef.current;
      if (recorder && recorder.state === "recording") {
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const remove = (id) => onChange((prev) => prev.filter((item) => item.id !== id));

  const btn =
    "flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#008388] hover:text-[#008388] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} disabled={disabled || full || recording || busy} onClick={() => cameraInput.current?.click()}>
          <Camera size={14} /> Take photo
        </button>
        <button type="button" className={btn} disabled={disabled || full || recording || busy} onClick={() => imageInput.current?.click()}>
          <ImageIcon size={14} /> Choose from gallery
        </button>
        <button type="button" className={btn} disabled={disabled || full || recording} onClick={() => pdfInput.current?.click()}>
          <FileText size={14} /> Add PDF
        </button>
        <button type="button" className={btn} disabled={disabled || full || recording} onClick={() => audioInput.current?.click()}>
          <Music size={14} /> Add audio file
        </button>

        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            <Square size={13} /> Stop · {clock(seconds)}
          </button>
        ) : (
          <button type="button" className={btn} disabled={disabled || full} onClick={startRecording}>
            <Mic size={14} /> Record voice
          </button>
        )}
      </div>

      <input ref={imageInput} type="file" hidden multiple accept="image/*" onChange={(e) => handleFiles(e, "image")} />
      <input ref={cameraInput} type="file" hidden accept="image/*" capture="environment" onChange={(e) => handleFiles(e, "image")} />
      <input ref={pdfInput} type="file" hidden multiple accept="application/pdf,.pdf" onChange={(e) => handleFiles(e, "pdf")} />
      <input ref={audioInput} type="file" hidden multiple accept="audio/*" onChange={(e) => handleFiles(e, "audio")} />

      {busy && (
        <p role="status" className="text-xs font-medium text-[#008388]">Preparing photos…</p>
      )}

      {recording && (
        <p className="flex items-center gap-2 text-xs font-medium text-red-600" role="status">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" /> Recording… press Stop when you're done.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((item) => (
            <li key={item.id || item.url} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
              {item.type === "image" ? (
                <img src={filesApi.resolveFileUrl(item.url, token)} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.type === "pdf" ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"}`}>
                  {item.type === "pdf" ? <FileText size={20} /> : <Music size={20} />}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">{item.name || "File"}</p>
                {item.type === "audio" && (
                  <audio controls preload="metadata" src={filesApi.resolveFileUrl(item.url, token)} className="mt-1 h-8 w-full" />
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(item.id)}
                disabled={disabled}
                aria-label={`Remove ${item.name || "file"}`}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 text-[11px] text-slate-400">
          <Paperclip size={12} /> Photos, PDFs and audio · up to {max} files · select many photos at once
        </p>
      )}
    </div>
  );
}
