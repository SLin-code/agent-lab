import type { ReactNode } from "react";

export function LessonSection({
  number,
  title,
  lead,
  children,
  id,
}: {
  number: string;
  title: string;
  lead?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="lesson-section" id={id}>
      <div className="lesson-section-heading">
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
          {lead ? <p>{lead}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
