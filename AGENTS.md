# AgentPath contribution instructions

This repository is an interactive Chinese course about Agent systems. Before
adding or changing a lesson, read:

- `docs/architecture.md`
- `docs/learning-contract.md`
- `docs/authoring-guide.md`

## Non-negotiable product rules

1. **Output is learning.** Every ready lesson must ask the learner to produce a
   reviewable artifact through `lesson.output`.
2. Lead with an interactive visual, prediction, trace, state change, failure or
   comparison. Do not use pseudocode as the primary explanation.
3. Interaction must make a concept easier to understand by revealing a
   meaningful state change, causal relationship or piece of evidence. If a
   static comparison communicates the same idea, prefer the static comparison.
4. Show decision summaries, actions, observations and state changes. Never
   expose or imitate hidden chain-of-thought.
5. Factual claims need a source, a precise `supports` statement and a
   `verifiedAt` date.
6. Keep one primary action per interaction state. Labs must be resettable,
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
  Lab chrome.
- Put a semantic interactive component in `labs/shared` only after it has at
  least two real consumers in different lessons. Until then, keep it inside the
  owning lesson's `labs/` directory. Do not build a universal graph or quiz
  engine in anticipation.
- Shared components must never import a specific lesson.
- Reuse tokens from `src/styles/tokens.css`. Do not introduce a new palette or
  page shell inside a lesson.
- Keep lesson-specific class names scoped by the lesson slug.

## Required checks

Run `pnpm typecheck` and `pnpm build` before handing off a change. For visual
changes, also inspect desktop and mobile layouts and exercise every interaction
branch. Both commands run `pnpm validate:content`, which executes the discovered
catalog, metadata contracts and lesson entry checks; do not bypass that validation.
