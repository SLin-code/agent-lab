import { useId, type ReactNode } from "react";

export function LabFrame({
  eyebrow,
  title,
  status,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  status?: ReactNode;
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
          <h3 id={titleId}>{title}</h3>
        </div>
        {status ? (
          <div
            aria-atomic="true"
            aria-live="polite"
            className="lab-status"
            role="status"
          >
            {status}
          </div>
        ) : null}
      </header>
      {children}
    </section>
  );
}
