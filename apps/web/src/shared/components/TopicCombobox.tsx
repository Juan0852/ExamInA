import { useState, useRef, useEffect } from "react";
import { Search, Check, Plus } from "lucide-react";

export interface TopicComboboxOption {
  id: string;
  name: string;
}

interface TopicComboboxProps {
  value: { id: string | null; name: string } | null;
  onChange: (value: { id: string | null; name: string } | null) => void;
  options: TopicComboboxOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TopicCombobox({
  value,
  onChange,
  options,
  placeholder = "Buscar o crear tema...",
  className = "",
  disabled = false,
}: TopicComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value?.name || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync search query with value when value changes externally
  useEffect(() => {
    setSearchQuery(value?.name || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search query to selected value if closed without selecting
        setSearchQuery(value?.name || "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exactMatch = options.find(
    (o) => o.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  const showCreateOption = searchQuery.trim().length > 0 && !exactMatch;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`w-full flex items-center rounded-2xl border ${
          isOpen
            ? "border-brand-blue dark:border-brand-cyan bg-white dark:bg-transparent"
            : "border-slate-200 dark:border-brand-navy/40 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100/50 dark:hover:bg-slate-900/20"
        } px-4 py-3 transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <Search size={16} className="text-slate-400 dark:text-slate-500 mr-2 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-bold outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/40 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 && !showCreateOption ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center font-bold">
                Escribe para buscar o crear un tema
              </div>
            ) : (
              <>
                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange({ id: option.id, name: option.name });
                      setSearchQuery(option.name);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all ${
                      value?.id === option.id
                        ? "bg-brand-blue/10 dark:bg-brand-cyan/10 text-brand-blue dark:text-brand-cyan"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                    }`}
                  >
                    {option.name}
                    {value?.id === option.id && <Check size={14} className="text-brand-blue dark:text-brand-cyan" />}
                  </button>
                ))}

                {showCreateOption && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ id: null, name: searchQuery.trim() });
                      setSearchQuery(searchQuery.trim());
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 mt-1 border-t border-slate-100 dark:border-brand-navy/20 rounded-xl text-left text-sm font-bold text-brand-blue dark:text-brand-cyan hover:bg-brand-blue/5 dark:hover:bg-brand-cyan/5 transition-all"
                  >
                    <Plus size={16} />
                    <span>Crear tema nuevo: <span className="font-black">"{searchQuery.trim()}"</span></span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
