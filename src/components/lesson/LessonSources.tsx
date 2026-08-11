import type { Claim, Source } from "../../content/curriculum/catalog";

export function LessonSources({
  claims,
  sources,
}: {
  claims: readonly Claim[];
  sources: readonly Source[];
}) {
  const claimById = new Map(claims.map((claim) => [claim.id, claim]));

  return (
    <section className="lesson-sources">
      <div>
        <span className="eyebrow">SOURCES</span>
        <h2>来源与核验</h2>
        <p>稳定原理与厂商实现分层维护，避免把产品 API 当成定义。</p>
      </div>
      <ul>
        {sources.map((source) => {
          const supportedClaims = source.supportsClaimIds
            .map((claimId) => claimById.get(claimId))
            .filter((claim): claim is Claim => Boolean(claim));

          return (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title}
              </a>
              <div className="source-meta">
                <span>{source.publisher}</span>
                <span>核验于 {source.verifiedAt}</span>
              </div>
              <div className="source-supports">
                <strong>支持的主张</strong>
                <ul>
                  {supportedClaims.map((claim) => (
                    <li key={claim.id}>{claim.statement}</li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
