import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ProgressValue {
  completed: Set<string>;
  toggleComplete: (lessonId: string) => void;
}

const STORAGE_KEY = "agent-path-progress-v1";
const ProgressContext = createContext<ProgressValue | null>(null);

function readInitialProgress() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return new Set<string>(value ? JSON.parse(value) : []);
  } catch {
    return new Set<string>();
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState(readInitialProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...completed]),
      );
    } catch {
      // Progress remains usable in memory when browser storage is unavailable.
    }
  }, [completed]);

  const value = useMemo<ProgressValue>(
    () => ({
      completed,
      toggleComplete: (lessonId) => {
        setCompleted((current) => {
          const next = new Set(current);
          if (next.has(lessonId)) next.delete(lessonId);
          else next.add(lessonId);
          return next;
        });
      },
    }),
    [completed],
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
