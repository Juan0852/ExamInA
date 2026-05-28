import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import {
  Camera,
  ImagePlus,
  Mic,
  Paintbrush,
  PenLine,
  Trash2,
  X
} from "lucide-react";

type AnswerAttachmentComposerProps = {
  disabled?: boolean;
};

type AttachmentPreview = {
  id: string;
  type: "image" | "canvas";
  name: string;
  url: string;
};

type Tool = "pen" | "eraser";

const createAttachmentId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function AnswerAttachmentComposer({ disabled = false }: AnswerAttachmentComposerProps) {
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [strokeColor, setStrokeColor] = useState("#0f7df2");
  const [strokeSize, setStrokeSize] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const attachmentsRef = useRef<AttachmentPreview[]>([]);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) => URL.revokeObjectURL(attachment.url));
    };
  }, []);

  useEffect(() => {
    if (!isBoardOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(rect.height * scale);
    context.scale(scale, scale);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);
    context.lineCap = "round";
    context.lineJoin = "round";
  }, [isBoardOpen]);

  const addImageFiles = (files: FileList | null) => {
    if (!files || disabled) return;

    const nextAttachments = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: createAttachmentId(),
        type: "image" as const,
        name: file.name || "Imagen de solución",
        url: URL.createObjectURL(file)
      }));

    setAttachments((current) => [...current, ...nextAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => {
      const target = current.find((attachment) => attachment.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((attachment) => attachment.id !== id);
    });
  };

  const getCanvasPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const drawTo = (point: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const previous = lastPointRef.current;
    if (!canvas || !previous) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = strokeColor;
    context.lineWidth = tool === "eraser" ? strokeSize * 2.2 : strokeSize;
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getCanvasPoint(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const point = getCanvasPoint(event);
    if (point) drawTo(point);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const rect = canvas.getBoundingClientRect();
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);
  };

  const saveBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      setAttachments((current) => [
        ...current,
        {
          id: createAttachmentId(),
          type: "canvas",
          name: `Tablero ${current.filter((item) => item.type === "canvas").length + 1}`,
          url: URL.createObjectURL(blob)
        }
      ]);
      setIsBoardOpen(false);
    }, "image/png");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-brand-navy/25 dark:bg-[#12243B]/40">
      <div className="flex flex-wrap gap-2">
        <label className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-brand-blue/35 hover:text-brand-blue dark:border-brand-navy/30 dark:bg-[#0E1B2F] dark:text-slate-300 ${disabled ? "pointer-events-none opacity-45" : ""}`}>
          <ImagePlus size={15} />
          <span>Subir imagen</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              addImageFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        <label className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-brand-blue/35 hover:text-brand-blue dark:border-brand-navy/30 dark:bg-[#0E1B2F] dark:text-slate-300 ${disabled ? "pointer-events-none opacity-45" : ""}`}>
          <Camera size={15} />
          <span>Tomar foto</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              addImageFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        <button
          type="button"
          onClick={() => setIsBoardOpen(true)}
          disabled={disabled}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-brand-blue/35 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-45 dark:border-brand-navy/30 dark:bg-[#0E1B2F] dark:text-slate-300"
        >
          <Paintbrush size={15} />
          <span>Tablero</span>
        </button>

        <button
          type="button"
          disabled
          className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-350 opacity-55 dark:border-brand-navy/30 dark:bg-[#0E1B2F]"
          title="Próximamente"
        >
          <Mic size={15} />
          <span>Voz</span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] uppercase text-slate-400 dark:bg-slate-800">
            Próximamente
          </span>
        </button>
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-brand-navy/25 dark:bg-[#0E1B2F]"
            >
              <img src={attachment.url} alt={attachment.name} className="h-24 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="truncate text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {attachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  disabled={disabled}
                  className="rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                  title="Quitar adjunto"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isBoardOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-brand-navy/30 dark:bg-[#0E1B2F]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-brand-navy/20">
              <div>
                <h4 className="text-sm font-black text-brand-navy dark:text-white">
                  Tablero de resolución
                </h4>
                <p className="text-[11px] font-semibold text-slate-400">
                  Dibuja fórmulas, esquemas o procedimientos y guárdalo como imagen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBoardOpen(false)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-brand-navy/20">
              <button
                type="button"
                onClick={() => setTool("pen")}
                className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-black transition ${
                  tool === "pen"
                    ? "bg-brand-blue text-white"
                    : "border border-slate-200 text-slate-500 hover:border-brand-blue/35 dark:border-brand-navy/30 dark:text-slate-300"
                }`}
              >
                <PenLine size={14} />
                Lápiz
              </button>
              <button
                type="button"
                onClick={() => setTool("eraser")}
                className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-black transition ${
                  tool === "eraser"
                    ? "bg-brand-blue text-white"
                    : "border border-slate-200 text-slate-500 hover:border-brand-blue/35 dark:border-brand-navy/30 dark:text-slate-300"
                }`}
              >
                <Trash2 size={14} />
                Borrador
              </button>
              <input
                type="color"
                value={strokeColor}
                onChange={(event) => setStrokeColor(event.target.value)}
                className="h-9 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 dark:border-brand-navy/30"
                title="Color"
              />
              <input
                type="range"
                min={2}
                max={16}
                value={strokeSize}
                onChange={(event) => setStrokeSize(Number(event.target.value))}
                className="h-9 w-28 accent-brand-blue"
                title="Grosor"
              />
              <button
                type="button"
                onClick={clearBoard}
                className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-500 transition hover:bg-slate-50 dark:border-brand-navy/30 dark:text-slate-300 dark:hover:bg-[#12243B]"
              >
                Limpiar
              </button>
            </div>

            <div className="min-h-0 flex-1 bg-slate-100 p-4 dark:bg-[#091526]">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
                className="h-[50vh] w-full touch-none rounded-2xl border border-slate-200 bg-white shadow-inner dark:border-brand-navy/30"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-brand-navy/20">
              <button
                type="button"
                onClick={() => setIsBoardOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-50 dark:border-brand-navy/30 dark:text-slate-300 dark:hover:bg-[#12243B]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveBoard}
                className="rounded-xl bg-brand-blue px-4 py-2 text-xs font-black text-white shadow-md shadow-brand-blue/15 transition hover:bg-brand-blue/90"
              >
                Guardar dibujo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
