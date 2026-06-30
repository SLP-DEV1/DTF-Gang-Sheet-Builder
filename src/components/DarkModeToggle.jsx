export default function DarkModeToggle({ enabled, onChange }) {
  return (
    <label className="toggle-line header-toggle">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>Dark Mode</span>
    </label>
  );
}
