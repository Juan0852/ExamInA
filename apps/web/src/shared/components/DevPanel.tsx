import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Code2, X, ChevronDown } from "lucide-react";
import { useLoginViewModel } from "../../viewmodels/useLoginViewModel";

/** Boolean de habilitación — ponlo en false para ocultarlo en producción */
const DEV_PANEL_ENABLED = import.meta.env.DEV;

/**
 * DevPanel: Caja flotante de herramientas de desarrollo.
 * Se superpone a cualquier otro elemento mediante posición fija con z-index alto.
 * Puede activarse/desactivarse con la constante DEV_PANEL_ENABLED.
 */
export function DevPanel() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { handleMockLogin, isLoading } = useLoginViewModel();

  if (!DEV_PANEL_ENABLED) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-start gap-1">
      {/* Panel expandido */}
      {isOpen && (
        <div className="bg-white dark:bg-[#0E1B2F] border border-amber-400/60 dark:border-amber-500/40 rounded-2xl shadow-2xl p-4 w-56 mb-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
              <Code2 size={12} />
              Dev Tools
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Mock Login */}
          <button
            type="button"
            onClick={() => {
              handleMockLogin();
              setIsOpen(false);
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <PlayCircle size={14} />
            Mock Login
          </button>
          
          <button
            type="button"
            onClick={() => {
              navigate("/onboarding");
              setIsOpen(false);
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer"
          >
            <PlayCircle size={14} />
            Ir a Onboarding
          </button>
          <p className="text-[9px] text-center text-slate-400 mt-1.5">
            Sin requerir Firebase Auth
          </p>
        </div>
      )}

      {/* Botón toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 border border-amber-400/60 dark:border-amber-500/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 shadow-lg transition-all cursor-pointer"
      >
        <Code2 size={12} />
        Dev
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
