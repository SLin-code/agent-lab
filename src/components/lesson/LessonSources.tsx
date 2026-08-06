import type { Source } from "../../content/curriculum/catalog";

export function LessonSources({ sources }: { sources: readonly Source[] }) {
  return (
    <section className="lesson-sources">
      <div>
        <span className="eyebrow">SOURCES</span>
        <h2>来源与核验</h2>
        <p>稳定原理与厂商实现分层维护，避免把产品 API 当成定义。</p>
      </div>
      <ul>
        {sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title}
            </a>
            <span>
              {source.publisher} · 支持：{source.supports} · 核验于{" "}
              {source.verifiedAt}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
