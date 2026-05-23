export default function SectionLabel({ number, title }) {
  return (
    <div className="sectionLabel">
      <div className="ghostNumber" aria-hidden="true">{number}</div>
      <div className="badgeRow">
        <div className="badgeAccentLine" aria-hidden="true" />
        <span
          className="badgeText"
          aria-label={`Section ${number}: ${title}`}
        >
          <span className="badgeNum">{number}</span>
          <span aria-hidden="true">—</span>
          <span>{title}</span>
        </span>
      </div>
    </div>
  );
}
