import React, { useState } from "react";

// Define the expected SurveySpec type based on backend output
interface Question {
  text: string;
  type: string;
  options?: string[];
  required: boolean;
}

interface SurveySpec {
  title: string;
  description: string;
  questions: Question[];
  target_audience: string;
  estimated_time: string;
  required_responses: number;
  [key: string]: unknown; // for any extra fields
}

// Responsive helper
const useResponsive = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

function SurveyView({ spec }: { spec: SurveySpec }) {
  const isMobile = useResponsive();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: isMobile ? 16 : 32,
        marginTop: 32,
        maxWidth: 700,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: isMobile ? 22 : 28 }}>
        {spec.title}
      </h2>
      <p style={{ color: "#555", marginTop: 0, fontSize: isMobile ? 15 : 17 }}>
        {spec.description}
      </p>
      <div style={{ margin: "16px 0", fontSize: isMobile ? 14 : 16 }}>
        <strong>Target Audience:</strong> {spec.target_audience}
        <br />
        <strong>Estimated Time:</strong> {spec.estimated_time}
        <br />
        <strong>Required Responses:</strong> {spec.required_responses}
      </div>
      <h3 style={{ marginBottom: 8, fontSize: isMobile ? 17 : 20 }}>
        Questions
      </h3>
      <ol style={{ paddingLeft: isMobile ? 16 : 20 }}>
        {spec.questions.map((q, i) => (
          <li key={i} style={{ marginBottom: isMobile ? 12 : 18 }}>
            <div style={{ fontWeight: 500, fontSize: isMobile ? 15 : 16 }}>
              {q.text}
            </div>
            <div
              style={{
                fontSize: isMobile ? 13 : 14,
                color: "#666",
                marginBottom: 4,
              }}
            >
              Type: {q.type.replace("_", " ")}
              {q.required ? " (Required)" : ""}
            </div>
            {q.options && (
              <ul style={{ margin: 0, paddingLeft: isMobile ? 12 : 18 }}>
                {q.options.map((opt, j) => (
                  <li key={j} style={{ fontSize: isMobile ? 13 : 14 }}>
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SurveySpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useResponsive();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data: SurveySpec = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#f6f8fa",
        minHeight: "100vh",
        width: "100vw",
        boxSizing: "border-box",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* App Bar */}
      <header
        style={{
          background: "#1a2233",
          color: "#fff",
          padding: isMobile ? "16px 0 12px 0" : "24px 0 18px 0",
          textAlign: "center",
          fontWeight: 700,
          fontSize: isMobile ? 22 : 32,
          letterSpacing: 1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          marginBottom: isMobile ? 18 : 36,
          width: "100%",
        }}
      >
        SurveyKong
      </header>
      {/* Main Content */}
      <main
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: isMobile ? "0 4vw" : "0 16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            padding: isMobile ? 14 : 28,
            marginBottom: isMobile ? 18 : 32,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <label style={{ fontWeight: 500, fontSize: isMobile ? 15 : 18 }}>
            Research Question:
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={isMobile ? 3 : 4}
              style={{
                width: "100%",
                marginTop: 8,
                fontSize: isMobile ? 14 : 16,
                borderRadius: 6,
                border: "1px solid #d0d7de",
                padding: isMobile ? 7 : 10,
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: isMobile ? 12 : 18,
              padding: isMobile ? "8px 18px" : "10px 28px",
              fontSize: isMobile ? 14 : 16,
              borderRadius: 6,
              border: "none",
              background: "#1a2233",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              width: isMobile ? "100%" : undefined,
              transition: "background 0.2s",
            }}
          >
            {loading ? "Generating..." : "Generate Survey Spec"}
          </button>
        </form>
        {error && (
          <div
            style={{
              color: "#b00020",
              marginTop: 16,
              fontWeight: 500,
              fontSize: isMobile ? 14 : 16,
            }}
          >
            Error: {error}
          </div>
        )}
        {result && <SurveyView spec={result} />}
      </main>
    </div>
  );
}

export default App;
