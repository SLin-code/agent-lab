import { useEffect, useId, useState } from "react";
import type { LearningOutput as LearningOutputSpec } from "../../content/curriculum/catalog";

interface SavedOutput {
  draft: string;
  checkedCriteria: string[];
}

export type LearningOutputStorageStatus = "saving" | "saved" | "error";

function readSavedOutput(
  lessonId: string,
  criteria: LearningOutputSpec["criteria"],
  outputRevision: number,
): SavedOutput {
  try {
    const value = window.localStorage.getItem(
      `agent-path-output-v1:${lessonId}`,
    );
    if (!value) return { draft: "", checkedCriteria: [] };
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") {
      return { draft: "", checkedCriteria: [] };
    }

    const candidate = parsed as {
      draft?: unknown;
      checkedCriteria?: unknown;
      revision?: unknown;
    };
    const criterionIds = new Set(criteria.map((criterion) => criterion.id));
    const checkedCriteria =
      candidate.revision === outputRevision &&
      Array.isArray(candidate.checkedCriteria)
      ? candidate.checkedCriteria
          .map((item) => {
            if (typeof item === "string") {
              if (criterionIds.has(item)) return item;
              return criteria.find((criterion) => criterion.text === item)?.id;
            }
            if (typeof item === "number") {
              return criteria.find(
                (criterion) => criterion.legacyIndex === item,
              )?.id;
            }
            return undefined;
          })
          .filter(
            (item): item is string =>
              typeof item === "string" && criterionIds.has(item),
          )
      : [];

    return {
      draft: typeof candidate.draft === "string" ? candidate.draft : "",
      checkedCriteria,
    };
  } catch {
    return { draft: "", checkedCriteria: [] };
  }
}

export function LearningOutput({
  lessonId,
  output,
  onReadyChange,
  onStorageStatusChange,
}: {
  lessonId: string;
  output: LearningOutputSpec;
  onReadyChange?: (ready: boolean) => void;
  onStorageStatusChange?: (status: LearningOutputStorageStatus) => void;
}) {
  const fieldId = useId();
  const [saved] = useState(() =>
    readSavedOutput(lessonId, output.criteria, output.revision),
  );
  const [draft, setDraft] = useState(saved.draft);
  const [checkedCriteria, setCheckedCriteria] = useState<Set<string>>(
    () => new Set(saved.checkedCriteria),
  );
  const [copyStatus, setCopyStatus] = useState("");
  const [storageStatus, setStorageStatus] =
    useState<LearningOutputStorageStatus>("saving");
  const isReady =
    draft.trim().length > 0 &&
    output.criteria.every((criterion) =>
      checkedCriteria.has(criterion.id)
    );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        `agent-path-output-v1:${lessonId}`,
        JSON.stringify({
          draft,
          checkedCriteria: [...checkedCriteria],
          revision: output.revision,
        }),
      );
      setStorageStatus("saved");
    } catch {
      setStorageStatus("error");
    }
  }, [checkedCriteria, draft, lessonId, output.revision]);

  useEffect(() => {
    onReadyChange?.(isReady);
  }, [isReady, onReadyChange]);

  useEffect(() => {
    onStorageStatusChange?.(storageStatus);
  }, [onStorageStatusChange, storageStatus]);

  function toggleCriterion(criterionId: string) {
    setStorageStatus("saving");
    setCheckedCriteria((current) => {
      const next = new Set(current);
      if (next.has(criterionId)) next.delete(criterionId);
      else next.add(criterionId);
      return next;
    });
  }

  async function copyDraft() {
    if (!draft.trim()) return;
    if (!navigator.clipboard) {
      setCopyStatus("当前浏览器不支持复制，请手动选择文本");
      return;
    }
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
        <span
          aria-live="polite"
          className="learning-output-status"
          role="status"
        >
          {storageStatus === "saving"
            ? "正在保存输出…"
            : storageStatus === "error"
              ? "未能自动保存，请先复制输出"
              : isReady
                ? "输出与自检已完成 · 已保存"
                : draft.trim()
                  ? `已自检 ${checkedCriteria.size} / ${output.criteria.length} · 已保存`
                  : "等待你的输出"}
        </span>
      </header>

      <div className="learning-output-workspace">
        <div className="learning-output-editor">
          <label htmlFor={fieldId}>
            <strong>{output.title}</strong>
            <span>{output.prompt}</span>
          </label>
          <p
            className="learning-output-transfer"
            id={`${fieldId}-transfer`}
          >
            <strong>迁移挑战</strong>
            {output.transferPrompt}
          </p>
          <textarea
            aria-describedby={`${fieldId}-transfer`}
            id={fieldId}
            onChange={(event) => {
              setStorageStatus("saving");
              setCopyStatus("");
              setDraft(event.target.value);
            }}
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
          {output.criteria.map((criterion) => {
            const id = `${fieldId}-criterion-${criterion.id}`;
            return (
              <label key={criterion.id} htmlFor={id}>
                <input
                  checked={checkedCriteria.has(criterion.id)}
                  id={id}
                  onChange={() => toggleCriterion(criterion.id)}
                  type="checkbox"
                />
                <span>{criterion.text}</span>
              </label>
            );
          })}
        </fieldset>
      </div>
    </section>
  );
}
