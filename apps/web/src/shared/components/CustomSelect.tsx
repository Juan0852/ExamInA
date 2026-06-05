import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Selecciona...",
  className = "",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-2xl border ${
          isOpen
            ? "border-brand-blue dark:border-brand-cyan bg-white dark:bg-transparent"
            : "border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100/50 dark:hover:bg-slate-900/20"
        } px-4 py-3 text-sm font-bold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className={selectedOption ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/40 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center font-bold">
                No hay opciones disponibles
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all ${
                    value === option.value
                      ? "bg-brand-blue/10 dark:bg-brand-cyan/10 text-brand-blue dark:text-brand-cyan"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  }`}
                >
                  {option.label}
                  {value === option.value && <Check size={14} className="text-brand-blue dark:text-brand-cyan" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
