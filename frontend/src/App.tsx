import React, { useState } from "react";

// Define the expected SurveySpec type based on backend output
// interface Question {
//   text: string;
//   type: string;
//   options?: string[];
//   required: boolean;
// }

interface SurveySpec {
  title: string;
  description: string;
  target_audience: string;
  targeted_completion_time: string;
  targeted_number_of_responses: number;
  hypothesis_tested: string[];
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
        <strong>Target Completion Time:</strong> {spec.targeted_completion_time}
        <br />
        <strong>Target Number of Responses:</strong>{" "}
        {spec.targeted_number_of_responses}
        <br />
        <strong>Hypotheses Tested:</strong>
        <ul style={{ margin: "8px 0 0 20px", paddingLeft: 0 }}>
          {spec.hypothesis_tested.map((hypothesis, index) => (
            <li key={index} style={{ marginBottom: "4px" }}>
              {hypothesis}
            </li>
          ))}
        </ul>
      </div>
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
  const [changes, setChanges] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
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
      <>
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
            maxWidth: 700,
            marginLeft: "auto",
            marginRight: "auto",
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
        {result && (
          <div
            style={{
              maxWidth: 700,
              marginLeft: "auto",
              marginRight: "auto",
              width: "100%",
              marginBottom: 24,
            }}
          >
            <SurveyView spec={result} />
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: isMobile ? 14 : 28,
                marginTop: 24,
                marginBottom: 32,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <label
                style={{
                  fontWeight: 500,
                  fontSize: isMobile ? 15 : 18,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Comments and Changes:
                <textarea
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
                  placeholder="Suggest changes or leave comments..."
                  value={changes}
                  onChange={(e) => setChanges(e.target.value)}
                />
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: isMobile ? "stretch" : "flex-end",
                }}
              >
                <button
                  type="button"
                  style={{
                    background: "#1a2233",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 6,
                    padding: isMobile ? "8px 14px" : "10px 22px",
                    fontSize: isMobile ? 14 : 16,
                    cursor: updateLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "background 0.2s",
                    opacity: updateLoading ? 0.7 : 1,
                  }}
                  onClick={async () => {
                    if (!result || !changes.trim()) return;
                    setUpdateLoading(true);
                    setUpdateError(null);
                    try {
                      const res = await fetch(
                        "http://localhost:8000/api/survey/update",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            survey_spec: result,
                            changes,
                          }),
                        }
                      );
                      if (!res.ok) throw new Error(`Error: ${res.status}`);
                      const data: SurveySpec = await res.json();
                      setResult(data);
                      setChanges("");
                    } catch (err: unknown) {
                      setUpdateError(
                        err instanceof Error ? err.message : "Unknown error"
                      );
                    } finally {
                      setUpdateLoading(false);
                    }
                  }}
                  disabled={updateLoading || !changes.trim()}
                >
                  {updateLoading ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  style={{
                    background: "#2e7d32",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 6,
                    padding: isMobile ? "8px 14px" : "10px 22px",
                    fontSize: isMobile ? 14 : 16,
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "background 0.2s",
                  }}
                  onClick={() => setCurrentStep("survey")}
                >
                  Approve
                </button>
              </div>
              {updateError && (
                <div
                  style={{
                    color: "#b00020",
                    marginTop: 10,
                    fontWeight: 500,
                    fontSize: isMobile ? 13 : 15,
                  }}
                >
                  Error: {updateError}
                </div>
              )}
            </div>
          </div>
        )}
      </>
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
