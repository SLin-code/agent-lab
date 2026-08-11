# AgentPath contribution instructions

This repository is an interactive Chinese course about Agent systems. Before
adding or changing a lesson, read:

- `docs/architecture.md`
- `docs/learning-contract.md`
- `docs/authoring-guide.md`

## Non-negotiable product rules

1. **Builder output is learning.** Contributors learn by researching, building,
   reviewing and publishing each lesson. This principle must never become a
   mandatory learner essay or per-lesson artifact.
2. Learner interactions must be low burden. Do not add `textarea`,
   `contenteditable` or any control that asks for long-form text. Prefer a
   choice, switch, ordered step, replay or direct comparison.
3. Reuse the same visible Run grammar whenever a process is involved:
   `Goal → See → Decide → Act → Observe → Continue / Stop`.
4. Change one meaningful variable and reveal one causal branch at a time. Do
   not expose a dashboard of independent controls before the learner has a
   stable mental model.
5. Interaction must make a concept easier to understand by revealing a state
   change, causal relationship or piece of evidence. If a static comparison is
   clearer, use the static comparison.
6. Show decision summaries, actions, observations and state changes. Never
   expose or imitate hidden chain-of-thought.
7. Factual claims need a source, a precise `supports` statement and a
   `verifiedAt` date.
8. Keep one primary action per interaction state. Labs must be resettable,
   keyboard operable and usable at 320px with reduced motion.

## Architecture rules

- A knowledge direction owns `src/content/domains/<domain>/`.
- A lesson owns all of its copy, metadata, data and one-off labs beneath
  `lessons/<slug>/`.
- Keep lesson metadata in `meta.ts`. It is discovered eagerly, so it must stay
  data-only and must not import the lesson component or browser-only code.
- Keep `index.tsx` as the lesson component entry. It must default-export the
  page component and is discovered lazily; do not duplicate metadata there.
- Do not hand-register a lesson. `src/content/curriculum/catalog.ts` discovers
  `meta.ts` files eagerly and pairs them with lazy `index.tsx` loaders.
- Reuse `components/lesson` for editorial structure and `components/lab` for
  Lab chrome and the shared minimal Run path. Use `MinimalRunExperiment` when
  the lesson has one variable, two choices and a decision at step three; do
  not widen it into a general state machine.
- Put a semantic interactive component in `labs/shared` only after it has at
  least two real consumers in different lessons. Do not build a universal
  graph or quiz engine in anticipation.
- Shared components must never import a specific lesson.
- Reuse tokens from `src/styles/tokens.css`. Do not introduce a new palette or
  page shell inside a lesson.
- Keep lesson-specific class names scoped by the lesson slug.

## Required checks

Run `pnpm typecheck` and `pnpm build` before handing off a change. For visual
changes, inspect desktop and 320px layouts, exercise both sides of the one
meaningful branch and confirm the page contains no long-form learner input.
Both commands run `pnpm validate:content`; do not bypass that validation.
