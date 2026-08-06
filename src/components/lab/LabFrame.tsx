import { useId, type ReactNode } from "react";

export function LabFrame({
  eyebrow,
  title,
  meta,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  meta?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={["lab", className].filter(Boolean).join(" ")}
    >
      <header className="lab-topbar">
        <div>
          <span className="lab-label">{eyebrow}</span>
          <strong id={titleId}>{title}</strong>
        </div>
        {meta}
      </header>
      {children}
    </section>
  );
}
