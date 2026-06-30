export default function PlacementWarnings({ result, highlightIssues, onHighlightIssuesChange }) {
  if (!result) return null;

  return (
    <section className={`panel placement-panel ${result.issues.length ? 'has-issues' : ''}`}>
      <h2>Platzierung</h2>
      <p className={result.issues.length ? 'warning' : 'meta'}>{result.summary}</p>
      <label className="toggle-line">
        <input
          type="checkbox"
          checked={highlightIssues}
          onChange={(event) => onHighlightIssuesChange(event.target.checked)}
        />
        <span>Betroffene Motive markieren</span>
      </label>
      {result.issues.length ? (
        <ul className="warning-list">
          {result.issues.slice(0, 8).map((issue, index) => (
            <li key={`${issue.type}-${index}`}>{issue.message}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
