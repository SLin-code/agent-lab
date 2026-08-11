import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ProgressValue {
  isComplete: (lessonId: string, outputRevision: number) => boolean;
  persistenceStatus: "saving" | "saved" | "memory-only";
  toggleComplete: (lessonId: string, outputRevision: number) => void;
}

const STORAGE_KEY = "agent-path-progress-v2";
const ProgressContext = createContext<ProgressValue | null>(null);

function readInitialProgress() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
      return {
        completions: new Map<string, number>(),
        persistenceStatus: "saving" as const,
      };
    }
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return {
        completions: new Map<string, number>(),
        persistenceStatus: "saving" as const,
      };
    }
    return {
      completions: new Map(
        parsed.filter(
          (entry): entry is [string, number] =>
            Array.isArray(entry) &&
            entry.length === 2 &&
            typeof entry[0] === "string" &&
            Number.isInteger(entry[1]) &&
            entry[1] > 0,
        ),
      ),
      persistenceStatus: "saving" as const,
    };
  } catch {
    return {
      completions: new Map<string, number>(),
      persistenceStatus: "memory-only" as const,
    };
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [initialProgress] = useState(readInitialProgress);
  const [completions, setCompletions] = useState(
    initialProgress.completions,
  );
  const [persistenceStatus, setPersistenceStatus] = useState<
    ProgressValue["persistenceStatus"]
  >(initialProgress.persistenceStatus);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...completions]),
      );
      setPersistenceStatus("saved");
    } catch {
      setPersistenceStatus("memory-only");
    }
  }, [completions]);

  const value = useMemo<ProgressValue>(
    () => ({
      isComplete: (lessonId, outputRevision) =>
        completions.get(lessonId) === outputRevision,
      persistenceStatus,
      toggleComplete: (lessonId, outputRevision) => {
        setPersistenceStatus("saving");
        setCompletions((current) => {
          const next = new Map(current);
          if (next.get(lessonId) === outputRevision) next.delete(lessonId);
          else next.set(lessonId, outputRevision);
          return next;
        });
      },
    }),
    [completions, persistenceStatus],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used inside ProgressProvider");
  }
  return context;
}
