import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { signOutClient } from "../services/firebase-client.service";
import {
  LogOut, 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Sun, 
  Moon, 
  Menu, 
  X,
  UserCircle
} from "lucide-react";

/**
 * Componente Sidebar para la navegación lateral responsiva.
 * Reemplaza al Navbar superior.
 */
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  
  // Estado para el menú lateral móvil
  const [isOpen, setIsOpen] = useState(false);
  
  // Estado para el tema oscuro/claro
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  // Inicializar tema leyendo localStorage al montar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      setTheme("light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      await signOutClient();
    } catch (e) {
      console.error("Error signing out from Firebase:", e);
    }
    clearSession();
    navigate("/login");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Lista de enlaces de navegación
  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      disabled: false,
    },
    {
      label: "Temario",
      path: "/subjects",
      icon: BookOpen,
      disabled: false,
    },
    {
      label: "Perfil",
      path: "/profile",
      icon: UserCircle,
      disabled: false,
    },
    {
      label: "Exámenes oficiales",
      path: "/official-exams",
      icon: GraduationCap,
      disabled: false,
    },
    {
      label: "Comunidad / Feed",
      path: "/feed",
      icon: Users,
      disabled: true,
      badge: "Próximamente",
    },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Contenido interno del sidebar (se reutiliza para desktop y mobile drawer)
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#0E1B2F] border-r border-slate-200 dark:border-brand-navy/30 transition-colors duration-200">
      {/* Cabecera del Sidebar: LOGO ENORME */}
      <div className="px-4 py-8 border-b border-slate-100 dark:border-brand-navy/15 flex flex-col items-center justify-center">
        <Link to="/dashboard" onClick={closeSidebar} className="group flex w-full justify-center focus:outline-none">
          <img
            src="/brand/examina-logo-transparent-cropped.png"
            alt="ExamInA"
            className="h-auto w-full max-w-[250px] transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      </div>

      {/* Enlaces de navegación */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          if (item.disabled) {
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-650 bg-slate-50/50 dark:bg-slate-900/10 cursor-not-allowed select-none"
                title={`${item.label} (${item.badge})`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={idx}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                active
                  ? "bg-gradient-to-r from-brand-blue/15 to-brand-cyan/5 text-brand-blue dark:text-brand-cyan border-l-4 border-brand-blue dark:border-brand-cyan shadow-sm shadow-brand-blue/5"
                  : "text-slate-600 dark:text-slate-350 hover:text-brand-blue dark:hover:text-brand-cyan hover:bg-slate-50 dark:hover:bg-slate-900/40"
              }`}
            >
              <Icon size={18} className={active ? "text-brand-blue dark:text-brand-cyan" : ""} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Pie del Sidebar: Config de Tema & Perfil de Usuario */}
      <div className="p-4 border-t border-slate-100 dark:border-brand-navy/15 space-y-4">
        {/* Toggle de Tema */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900/50 border border-slate-200/50 dark:border-brand-navy/20 transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === "light" ? "Modo Oscuro" : "Modo Claro"}</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold">
            {theme === "light" ? "Light" : "Dark"}
          </span>
        </button>

        {/* Info del Estudiante */}
        {user && (
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-brand-navy/10 rounded-2xl border border-slate-100 dark:border-brand-navy/35">
            <div className="flex items-center space-x-3 min-w-0">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.displayName || "Avatar"}
                  className="w-9 h-9 rounded-full border border-brand-blue/20 flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-sky dark:bg-slate-800 text-brand-blue dark:text-brand-cyan flex items-center justify-center font-black text-xs border border-brand-blue/20 flex-shrink-0">
                  {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {user.displayName || "Estudiante"}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  PAU 2026
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-1.5 text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE HEADER (md:hidden) */}
      <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-[#0E1B2F] border-b border-slate-200 dark:border-brand-navy/30 fixed top-0 left-0 right-0 z-40 transition-colors duration-200">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl focus:outline-none cursor-pointer"
        >
          <Menu size={22} />
        </button>
        
        {/* Logo del Header Móvil (Más compacto pero visible) */}
        <Link to="/dashboard" className="flex items-center">
          <img
            src="/brand/examina-logo-transparent-cropped.png"
            alt="ExamInA"
            className="h-auto w-40"
          />
        </Link>

        {/* Avatar rápido en cabecera móvil */}
        <div>
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-brand-blue/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-sky dark:bg-slate-800 text-brand-blue dark:text-brand-cyan flex items-center justify-center font-bold text-xs">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "ES"}
            </div>
          )}
        </div>
      </header>

      {/* DESKTOP SIDEBAR (md:flex) */}
      <aside className="hidden md:flex flex-col w-72 h-screen fixed top-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        >
          {/* Drawer Panel */}
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0E1B2F] shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar móvil */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={closeSidebar}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-brand-navy/20 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
