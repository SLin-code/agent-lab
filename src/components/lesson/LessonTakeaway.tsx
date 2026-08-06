import type { ReactNode } from "react";

export function LessonTakeaway({ children }: { children: ReactNode }) {
  return (
    <section className="lesson-conclusion">
      <span>TAKEAWAY</span>
      <blockquote>{children}</blockquote>
    </section>
  );
}
