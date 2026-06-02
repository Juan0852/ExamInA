import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { signOutClient } from "../services/firebase-client.service";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api.service";
import { useUiStore } from "../../stores/ui.store";
import { useNotificationsStore } from "../../stores/notifications.store";
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
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  DraftingCompass
} from "lucide-react";

/**
 * Componente Sidebar para la navegación lateral responsiva.
 * Reemplaza al Navbar superior.
 */
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const clearSession = useAuthStore((state) => state.clearSession);
  
  // Collapse and Notifications stores
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapse = useUiStore((state) => state.toggleSidebarCollapse);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationsStore((state) => state.setUnreadCount);
  const openDrawer = useNotificationsStore((state) => state.openDrawer);

  // Poll for notifications count
  const notificationsQuery = useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      if (!token) return { data: [], meta: { unread: 0 } };
      return apiService.get<any>("/notifications");
    },
    enabled: !!token,
    refetchInterval: 10000
  });

  const serverUnread = notificationsQuery.data?.meta?.unread ?? 0;

  useEffect(() => {
    setUnreadCount(serverUnread);
  }, [serverUnread, setUnreadCount]);

  // Estado para el menú lateral móvil
  const [isOpen, setIsOpen] = useState(false);
  
  // Estado para el tema oscuro/claro (Fijado en Light Mode temporalmente)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Forzar Light Mode al iniciar
  useEffect(() => {
    setTheme("light");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    // Deshabilitado temporalmente
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
      isHeader: true,
      label: "Exámenes",
    },
    {
      label: "Por temas",
      path: "/subjects",
      icon: BookOpen,
      disabled: false,
    },
    {
      label: "Oficiales completos",
      path: "/official-exams",
      icon: GraduationCap,
      disabled: false,
    },
    {
      isHeader: true,
      label: "Cuenta",
    },
    {
      label: "Perfil",
      path: "/profile",
      icon: UserCircle,
      disabled: false,
    },
    {
      isHeader: true,
      label: "Social",
    },
    {
      label: "Modo Arquitecto",
      path: "/architect",
      icon: DraftingCompass,
      disabled: true,
      badge: "Próximamente",
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
  // Contenido interno del sidebar (se reutiliza para desktop y mobile drawer)
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = !isMobile && sidebarCollapsed;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0E1B2F] border-r border-slate-200 dark:border-brand-navy/30 transition-colors duration-200">
        {/* Cabecera del Sidebar: LOGO */}
        <div className={`px-4 py-8 border-b border-slate-100 dark:border-brand-navy/15 flex items-center justify-between relative ${isCollapsed ? "px-2" : ""}`}>
          <Link to="/dashboard" onClick={closeSidebar} className="group flex flex-1 items-center justify-center focus:outline-none">
            {isCollapsed ? (
              <img
                src="/brand/examina-logo-mark.png"
                alt="E"
                className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-[1.05]"
              />
            ) : (
              <img
                src="/brand/examina-logo-transparent-cropped.png"
                alt="ExamInA"
                className="h-auto w-full max-w-[250px] transition-transform duration-300 group-hover:scale-[1.02]"
              />
            )}
          </Link>

          {!isMobile && (
            <button
              onClick={toggleSidebarCollapse}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center justify-center h-6 w-6 rounded-full border border-slate-200 dark:border-brand-navy/40 bg-white dark:bg-[#0E1B2F] text-slate-505 hover:text-brand-blue dark:hover:text-brand-cyan shadow-sm hover:scale-110 transition-all cursor-pointer"
              title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          )}
        </div>

        {/* Enlaces de navegación */}
        <div className={`flex-1 py-6 space-y-1.5 overflow-y-auto ${isCollapsed ? "px-0 flex flex-col items-center" : "px-4"}`}>
          {navItems.map((item, idx) => {
            if (item.isHeader) {
              return !isCollapsed ? (
                <div key={idx} className="pt-5 pb-1 px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {item.label}
                  </span>
                </div>
              ) : (
                <div key={idx} className="pt-5 pb-1 w-full flex justify-center">
                  <div className="w-5 h-[3px] rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              );
            }

            const Icon = item.icon!;
            const active = isActive(item.path!);
            
            if (item.disabled) {
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl text-sm font-medium text-slate-400 dark:text-slate-650 bg-slate-50/50 dark:bg-slate-900/10 cursor-not-allowed select-none ${
                    isCollapsed 
                      ? "w-12 h-12 justify-center space-x-0" 
                      : "px-4 py-3.5 space-x-3"
                  }`}
                  title={`${item.label} (${item.badge})`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center space-x-0" : "space-x-3"}`}>
                    <Icon size={isCollapsed ? 26 : 18} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
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
                className={`flex items-center rounded-xl text-sm font-bold transition-all ${
                  isCollapsed 
                    ? "w-12 h-12 justify-center space-x-0 border border-transparent" 
                    : "px-4 py-3.5 space-x-3"
                } ${
                  active
                    ? isCollapsed
                      ? "bg-gradient-to-r from-brand-blue/15 to-brand-cyan/5 text-brand-blue dark:text-brand-cyan !border-brand-blue/20 dark:!border-brand-cyan/30 shadow-sm shadow-brand-blue/5"
                      : "bg-gradient-to-r from-brand-blue/15 to-brand-cyan/5 text-brand-blue dark:text-brand-cyan border-l-4 border-brand-blue dark:border-brand-cyan shadow-sm shadow-brand-blue/5"
                    : "text-slate-600 dark:text-slate-350 hover:text-brand-blue dark:hover:text-brand-cyan hover:bg-slate-50 dark:hover:bg-slate-900/40"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={isCollapsed ? 26 : 18} className={active ? "text-brand-blue dark:text-brand-cyan" : ""} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Botón de Notificaciones */}
        <div className={`py-2 border-t border-slate-100 dark:border-brand-navy/15 ${isCollapsed ? "px-0 flex justify-center" : "px-4"}`}>
          <button
            onClick={openDrawer}
            className={`flex items-center rounded-xl text-sm font-bold transition-all relative text-slate-600 dark:text-slate-350 hover:text-brand-blue dark:hover:text-brand-cyan hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer ${
              isCollapsed 
                ? "w-12 h-12 justify-center space-x-0 border border-transparent" 
                : "w-full px-4 py-3.5 space-x-3"
            }`}
            title="Notificaciones"
          >
            <div className="relative">
              <Bell size={isCollapsed ? 26 : 18} />
              {unreadCount > 0 && (
                <span className={`absolute flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse ${
                  isCollapsed ? "-top-1 -right-1" : "-top-1.5 -right-1.5"
                }`}>
                  {unreadCount}
                </span>
              )}
            </div>
            {!isCollapsed && <span>Notificaciones</span>}
          </button>
        </div>

        {/* Pie del Sidebar: Config de Tema & Perfil de Usuario */}
        <div className={`border-t border-slate-100 dark:border-brand-navy/15 space-y-4 ${isCollapsed ? "px-0 py-4 flex flex-col items-center" : "p-4"}`}>
          {/* Toggle de Tema (Deshabilitado temporalmente) */}
          <button
            disabled
            className={`flex items-center rounded-xl text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-brand-navy/10 cursor-not-allowed select-none opacity-60 transition-all ${
              isCollapsed 
                ? "w-12 h-12 justify-center space-x-0" 
                : "w-full justify-between px-4 py-2.5"
            }`}
            title="Modo Oscuro (Próximamente)"
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center space-x-0" : "space-x-2.5"}`}>
              <Moon size={isCollapsed ? 22 : 16} />
              {!isCollapsed && <span>Modo Oscuro</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Próximamente
              </span>
            )}
          </button>

          {/* Info del Estudiante */}
          {user && (
            isCollapsed ? (
              <div className="flex flex-col items-center space-y-3.5">
                {/* Avatar */}
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.displayName || "Avatar"}
                    className="w-10 h-10 rounded-full border border-brand-blue/20 hover:scale-105 transition-transform cursor-pointer"
                    title={user.displayName || "Estudiante"}
                    onClick={() => navigate("/profile")}
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full bg-brand-sky dark:bg-slate-800 text-brand-blue dark:text-brand-cyan flex items-center justify-center font-black text-sm border border-brand-blue/20 hover:scale-105 transition-transform cursor-pointer" 
                    title={user.displayName || "Estudiante"}
                    onClick={() => navigate("/profile")}
                  >
                    {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}
                  </div>
                )}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-red-100/10 dark:border-red-950/10 transition-all cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-brand-navy/10 rounded-2xl border border-slate-100 dark:border-brand-navy/35">
                <div className="flex items-center space-x-3 min-w-0">
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt={user.displayName || "Avatar"}
                      className="w-9 h-9 rounded-full border border-brand-blue/20 flex-shrink-0"
                      title={user.displayName || "Estudiante"}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-sky dark:bg-slate-800 text-brand-blue dark:text-brand-cyan flex items-center justify-center font-black text-xs border border-brand-blue/20 flex-shrink-0" title={user.displayName || "Estudiante"}>
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
            )
          )}
        </div>
      </div>
    );
  };


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
      <aside className={`hidden md:flex flex-col h-screen fixed top-0 left-0 z-30 transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-72"
      }`}>
        <SidebarContent isMobile={false} />
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

            <SidebarContent isMobile={true} />
          </div>
        </div>
      )}
    </>
  );
}
