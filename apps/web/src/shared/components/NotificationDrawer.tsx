import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Trophy, BookOpen, UserPlus, MessageSquare, Heart, Check, Trash2, Loader2, Bell } from "lucide-react";
import { useNotificationsStore } from "../../stores/notifications.store";
import { useAuthStore } from "../../stores/auth.store";
import { apiService } from "../services/api.service";
import { useState } from "react";

export function NotificationDrawer() {
  const isDrawerOpen = useNotificationsStore((state) => state.isDrawerOpen);
  const closeDrawer = useNotificationsStore((state) => state.closeDrawer);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ["notifications-list"],
    queryFn: async () => {
      if (!token) return { data: [] };
      return apiService.get<{ data: any[] }>("/notifications");
    },
    enabled: isDrawerOpen && !!token,
  });

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.patch(`/notifications/${id}/read`);
      await queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.post("/notifications/read-all");
      await queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    } catch (err) {
      console.error("Error marking all notifications as read", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await apiService.delete("/notifications/clear");
      await queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    } catch (err) {
      console.error("Error clearing notifications", err);
    }
  };

  const handleFriendResponse = async (friendshipId: string, action: "ACCEPT" | "REJECT", notificationId: string) => {
    setProcessingId(notificationId);
    try {
      await apiService.post("/auth/friends/respond", { friendshipId, action });
      // Mark notification as read
      await apiService.patch(`/notifications/${notificationId}/read`);
      
      // Invalidate queries to refresh lists
      await queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      await queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    } catch (err) {
      console.error("Error responding to friend request", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isDrawerOpen) return null;

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "ACHIEVEMENT_UNLOCK":
        return {
          icon: Trophy,
          bgClass: "bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
          hoverClass: "hover:border-amber-500/30 dark:hover:border-amber-500/40",
        };
      case "EXAM_FINISHED":
        return {
          icon: BookOpen,
          bgClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30",
          hoverClass: "hover:border-cyan-500/30 dark:hover:border-cyan-500/40",
        };
      case "EXAM_CREATED":
        return {
          icon: BookOpen,
          bgClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
          hoverClass: "hover:border-emerald-500/30 dark:hover:border-emerald-500/40",
        };
      case "FRIEND_REQUEST":
        return {
          icon: UserPlus,
          bgClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30",
          hoverClass: "hover:border-indigo-500/30 dark:hover:border-indigo-500/40",
        };
      case "POST_COMMENTED":
        return {
          icon: MessageSquare,
          bgClass: "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
          hoverClass: "hover:border-rose-500/30 dark:hover:border-rose-500/40",
        };
      case "POST_LIKED":
        return {
          icon: Heart,
          bgClass: "bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
          hoverClass: "hover:border-red-500/30 dark:hover:border-red-500/40",
        };
      default:
        return {
          icon: Bell,
          bgClass: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
          hoverClass: "hover:border-slate-500/30 dark:hover:border-slate-500/40",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeDrawer}
      />

      {/* Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300 dark:border-brand-navy/30 dark:bg-[#0E1B2F] animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-brand-navy/20">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-brand-navy dark:text-white">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-black text-white">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-navy/30 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action toolbar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-6 py-3 dark:border-brand-navy/10 dark:bg-brand-navy/5">
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-black uppercase tracking-wider text-brand-blue hover:text-brand-blue/80 dark:text-brand-cyan dark:hover:text-brand-cyan/80 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check size={12} />
              Marcar todo leído
            </button>
            <button
              onClick={handleClearAll}
              className="text-[11px] font-black uppercase tracking-wider text-red-500 hover:text-red-650 transition cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={12} />
              Eliminar todas
            </button>
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notificationsQuery.isLoading ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <Loader2 size={32} className="animate-spin text-brand-cyan" />
              <p className="mt-3 text-xs font-bold">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-450 p-6">
              <div className="rounded-full bg-slate-50 dark:bg-brand-navy/10 p-5 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-brand-navy/20">
                <Bell size={32} />
              </div>
              <h3 className="mt-4 text-sm font-black text-brand-navy dark:text-white">Sin notificaciones</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                Aquí recibirás alertas sobre medallas, solicitudes de amistad y actividad en tus exámenes.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const styles = getNotificationStyles(n.type);
              const Icon = styles.icon;
              const meta = n.metadata as any;
              const isFriendPendingRequest = n.type === "FRIEND_REQUEST" && meta?.friendshipId && !n.read && n.title.includes("recibida");

              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                  className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 dark:bg-[#0E1B2F]/60 ${
                    n.read
                      ? "border-slate-100 dark:border-brand-navy/10 opacity-75"
                      : `border-slate-200 dark:border-brand-cyan/15 ${styles.hoverClass} shadow-md shadow-brand-blue/5`
                  } ${!n.read ? "cursor-pointer" : ""}`}
                >
                  {/* Left accent color for unread */}
                  {!n.read && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      n.type === "ACHIEVEMENT_UNLOCK" ? "bg-amber-500" :
                      n.type === "EXAM_FINISHED" ? "bg-cyan-500" :
                      n.type === "EXAM_CREATED" ? "bg-emerald-500" :
                      n.type === "FRIEND_REQUEST" ? "bg-indigo-500" :
                      n.type === "POST_COMMENTED" ? "bg-rose-500" : "bg-red-500"
                    }`} />
                  )}

                  <div className="flex gap-3">
                    <div className={`rounded-xl border p-2 shrink-0 h-10 w-10 flex items-center justify-center ${styles.bgClass}`}>
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-brand-navy dark:text-white truncate">
                          {n.title}
                        </h4>
                        <span className="text-[9px] font-semibold text-slate-400 shrink-0">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed leading-tight">
                        {n.content}
                      </p>

                      {/* Interactive Actions for Friend Requests */}
                      {isFriendPendingRequest && (
                        <div className="mt-3 flex gap-2 pt-2 border-t border-slate-50 dark:border-brand-navy/10">
                          <button
                            disabled={processingId === n.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFriendResponse(meta.friendshipId, "ACCEPT", n.id);
                            }}
                            className="flex-1 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan py-1.5 text-[10px] font-black uppercase tracking-wider text-white hover:brightness-105 transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {processingId === n.id ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              "Aceptar"
                            )}
                          </button>
                          <button
                            disabled={processingId === n.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFriendResponse(meta.friendshipId, "REJECT", n.id);
                            }}
                            className="flex-1 rounded-xl border border-slate-200 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-55 transition flex items-center justify-center gap-1 cursor-pointer dark:border-brand-navy/30 dark:text-slate-400 dark:hover:bg-brand-navy/20 disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
