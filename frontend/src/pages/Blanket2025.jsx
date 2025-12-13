import Card from "../components/ui/Card";

export default function Blanket2025() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        <Card>
          <h2>UI Test</h2>
          <p>If you see this, rendering works.</p>
        </Card>
      </div>
    </div>
  );
}
