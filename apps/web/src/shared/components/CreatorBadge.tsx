type CreatorBadgeProps = {
  name: string;
  username?: string | null;
  photoUrl?: string | null;
  align?: "left" | "right";
  official?: boolean;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function CreatorBadge({
  name,
  username,
  photoUrl,
  align = "right",
  official = false
}: CreatorBadgeProps) {
  const avatarUrl = photoUrl || (official ? "/brand/examina-logo-mark.png" : null);

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm dark:border-brand-navy/30 dark:bg-[#12243B]/70 ${
        align === "right" ? "justify-end text-right" : "justify-start text-left"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
          Creador
        </p>
        <p className="truncate text-xs font-black text-slate-700 dark:text-slate-200">
          {name}
        </p>
        {username && (
          <p className="truncate text-[10px] font-bold text-brand-blue dark:text-brand-cyan">
            @{username}
          </p>
        )}
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-blue/15 bg-brand-sky text-xs font-black text-brand-blue shadow-sm dark:border-brand-cyan/20 dark:bg-brand-cyan/10 dark:text-brand-cyan">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          getInitials(name || "E")
        )}
      </div>
    </div>
  );
}
