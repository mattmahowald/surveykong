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

const WORKFLOW_STEPS = [
  { key: "framing", label: "Framing", description: "Define research question" },
  {
    key: "survey",
    label: "Survey Design",
    description: "Review/refine survey",
  },
  { key: "cohort", label: "Cohort Selection", description: "Select audience" },
  { key: "distribution", label: "Distribution", description: "Send & collect" },
  { key: "analysis", label: "Analysis", description: "Analyze results" },
];

type WorkflowStep = (typeof WORKFLOW_STEPS)[number]["key"];

// Responsive helper
const useResponsive = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
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

function WorkflowPane({
  current,
  onStepClick,
  isMobile,
}: {
  current: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
  isMobile: boolean;
}) {
  return (
    <nav
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: isMobile ? 10 : 24,
        margin: isMobile ? "12px 0 0 0" : "0 0 0 32px",
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        alignItems: isMobile ? "center" : "stretch",
        justifyContent: isMobile ? "space-between" : undefined,
        width: isMobile ? "100%" : 220,
        minWidth: isMobile ? undefined : 180,
        gap: isMobile ? 0 : 12,
        boxSizing: "border-box",
      }}
      aria-label="Workflow steps"
    >
      {WORKFLOW_STEPS.map((step, idx) => {
        const active = current === step.key;
        return (
          <button
            key={step.key}
            onClick={() => onStepClick(step.key as WorkflowStep)}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "flex-start",
              background: active ? "#1a2233" : "#f6f8fa",
              color: active ? "#fff" : "#1a2233",
              border: "none",
              borderRadius: 8,
              padding: isMobile ? "8px 6px" : "10px 12px",
              margin: isMobile ? "0 2px" : 0,
              fontWeight: active ? 700 : 500,
              fontSize: isMobile ? 13 : 15,
              cursor: "pointer",
              width: isMobile ? "100%" : "100%",
              marginBottom: isMobile ? 0 : 6,
              outline: active ? "2px solid #1a2233" : undefined,
              transition: "background 0.15s, color 0.15s",
              boxShadow: active ? "0 2px 8px rgba(26,34,51,0.08)" : undefined,
            }}
            aria-current={active ? "step" : undefined}
          >
            <span
              style={{
                marginRight: isMobile ? 0 : 10,
                marginBottom: isMobile ? 2 : 0,
              }}
            >
              {idx + 1}.
            </span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SurveySpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("framing");
  const isMobile = useResponsive();

  // Reset state if user goes back to framing
  React.useEffect(() => {
    if (currentStep === "framing") {
      setResult(null);
      setError(null);
      setLoading(false);
    }
  }, [currentStep]);

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
      setCurrentStep("survey");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Main content for each step
  let mainContent: React.ReactNode = null;
  if (currentStep === "framing") {
    mainContent = (
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
    );
  } else if (currentStep === "survey") {
    mainContent = result ? <SurveyView spec={result} /> : null;
  } else if (currentStep === "cohort") {
    mainContent = (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          padding: isMobile ? 16 : 32,
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#888", fontSize: isMobile ? 15 : 18 }}>
          Cohort selection coming soon…
        </span>
      </div>
    );
  } else if (currentStep === "distribution") {
    mainContent = (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          padding: isMobile ? 16 : 32,
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#888", fontSize: isMobile ? 15 : 18 }}>
          Distribution coming soon…
        </span>
      </div>
    );
  } else if (currentStep === "analysis") {
    mainContent = (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          padding: isMobile ? 16 : 32,
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#888", fontSize: isMobile ? 15 : 18 }}>
          Analysis coming soon…
        </span>
      </div>
    );
  }

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
      {/* Main Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "flex-start",
          justifyContent: "center",
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "0 4vw" : "0 16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>{mainContent}</div>
        <div
          style={{
            width: isMobile ? "100%" : 240,
            minWidth: isMobile ? undefined : 180,
          }}
        >
          <WorkflowPane
            current={currentStep}
            onStepClick={setCurrentStep}
            isMobile={isMobile}
          />
        </div>
      </div>
      {error && currentStep === "framing" && (
        <div
          style={{
            color: "#b00020",
            marginTop: 16,
            fontWeight: 500,
            fontSize: isMobile ? 14 : 16,
            textAlign: "center",
          }}
        >
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default App;
