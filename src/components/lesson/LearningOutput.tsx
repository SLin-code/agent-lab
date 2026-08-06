import { useEffect, useId, useState } from "react";
import type { LearningOutput as LearningOutputSpec } from "../../content/curriculum/catalog";

interface SavedOutput {
  draft: string;
  checkedCriteria: number[];
}

function readSavedOutput(lessonId: string): SavedOutput {
  try {
    const value = window.localStorage.getItem(
      `agent-path-output-v1:${lessonId}`,
    );
    if (!value) return { draft: "", checkedCriteria: [] };
    return JSON.parse(value) as SavedOutput;
  } catch {
    return { draft: "", checkedCriteria: [] };
  }
}

export function LearningOutput({
  lessonId,
  output,
}: {
  lessonId: string;
  output: LearningOutputSpec;
}) {
  const fieldId = useId();
  const [saved] = useState(() => readSavedOutput(lessonId));
  const [draft, setDraft] = useState(saved.draft);
  const [checkedCriteria, setCheckedCriteria] = useState(
    () => new Set(saved.checkedCriteria),
  );
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(
        `agent-path-output-v1:${lessonId}`,
        JSON.stringify({
          draft,
          checkedCriteria: [...checkedCriteria],
        }),
      );
    } catch {
      // The draft remains available in memory if storage is unavailable.
    }
  }, [checkedCriteria, draft, lessonId]);

  function toggleCriterion(index: number) {
    setCheckedCriteria((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function copyDraft() {
    if (!draft.trim() || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopyStatus("已复制");
    } catch {
      setCopyStatus("复制失败，请手动选择文本");
    }
  }

  return (
    <section className="learning-output" id="learning-output">
      <header className="learning-output-heading">
        <div>
          <span className="eyebrow">LEARNING OUTPUT</span>
          <h2>输出，才算真正学会</h2>
          <p>{output.description}</p>
        </div>
        <span className="learning-output-status">
          {draft.trim() ? "已自动保存在当前浏览器" : "等待你的输出"}
        </span>
      </header>

      <div className="learning-output-workspace">
        <div className="learning-output-editor">
          <label htmlFor={fieldId}>
            <strong>{output.title}</strong>
            <span>{output.prompt}</span>
          </label>
          <textarea
            id={fieldId}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={output.placeholder}
            rows={7}
            value={draft}
          />
          <div className="learning-output-actions">
            <span>{draft.trim().length} 字</span>
            <span aria-live="polite">{copyStatus}</span>
            <button
              className="button"
              disabled={!draft.trim()}
              onClick={copyDraft}
              type="button"
            >
              复制输出
            </button>
          </div>
        </div>

        <fieldset className="learning-output-criteria">
          <legend>提交前自检</legend>
          {output.criteria.map((criterion, index) => {
            const id = `${fieldId}-criterion-${index}`;
            return (
              <label key={criterion} htmlFor={id}>
                <input
                  checked={checkedCriteria.has(index)}
                  id={id}
                  onChange={() => toggleCriterion(index)}
                  type="checkbox"
                />
                <span>{criterion}</span>
              </label>
            );
          })}
        </fieldset>
      </div>
    </section>
  );
}
