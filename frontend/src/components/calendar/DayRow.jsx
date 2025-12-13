import ColorSwatch from "./ColorSwatch";

export default function DayRow({ date }) {
return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <ColorSwatch />

      <span style={{ flex: 1 }}>{date}</span>

      {temp != null && <span>{temp}°F</span>}
    </div>
  );
}