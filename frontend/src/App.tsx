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
  targeted_completion_time: string;
  targeted_number_of_responses: number;
  hypothesis_tested: string[];
  [key: string]: unknown; // for any extra fields
}

interface Survey {
  title: string;
  description: string;
  questions: Question[];
  spec_id?: string;
}

interface Cohort {
  target_audience: string;
  inclusion_criteria: string[];
  exclusion_criteria: string[];
  estimated_pool_size?: string;
  recruitment_notes?: string;
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
        maxWidth: isMobile ? "100%" : 900,
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
        <strong>Target Number of Responses:</strong> {spec.targeted_number_of_responses}
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

function SurveyQuestionsView({ survey }: { survey: Survey }) {
  const isMobile = useResponsive();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: isMobile ? 16 : 32,
        marginTop: 16,
        maxWidth: isMobile ? "100%" : 900,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: isMobile ? 18 : 22 }}>
        Survey Questions
      </h3>
      <p style={{ color: "#555", fontSize: isMobile ? 14 : 16, marginBottom: 20 }}>
        {survey.description}
      </p>
      <ol style={{ paddingLeft: isMobile ? 16 : 20 }}>
        {survey.questions.map((q, i) => (
          <li key={i} style={{ marginBottom: isMobile ? 16 : 20 }}>
            <div style={{ fontWeight: 500, fontSize: isMobile ? 15 : 16, marginBottom: 6 }}>
              {q.text}
            </div>
            <div
              style={{
                fontSize: isMobile ? 13 : 14,
                color: "#666",
                marginBottom: 6,
              }}
            >
              Type: {q.type.replace("_", " ")}
              {q.required ? " (Required)" : " (Optional)"}
            </div>
            {q.options && (
              <ul style={{ margin: 0, paddingLeft: isMobile ? 12 : 18 }}>
                {q.options.map((opt, j) => (
                  <li key={j} style={{ fontSize: isMobile ? 13 : 14, color: "#666" }}>
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

function CohortView({ cohort }: { cohort: Cohort }) {
  const isMobile = useResponsive();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: isMobile ? 16 : 32,
        marginTop: 16,
        maxWidth: isMobile ? "100%" : 900,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: isMobile ? 18 : 22 }}>
        Cohort Selection Criteria
      </h3>
      
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: isMobile ? 15 : 16, 
          marginBottom: 8,
          color: "#1a2233"
        }}>
          Target Audience
        </div>
        <div style={{ 
          fontSize: isMobile ? 14 : 16,
          color: "#555",
          marginBottom: 16
        }}>
          {cohort.target_audience}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: isMobile ? 15 : 16, 
          marginBottom: 8,
          color: "#1a2233"
        }}>
          Inclusion Criteria
        </div>
        <ul style={{ margin: "0 0 0 20px", paddingLeft: 0 }}>
          {cohort.inclusion_criteria.map((criterion, index) => (
            <li key={index} style={{ 
              marginBottom: "6px",
              fontSize: isMobile ? 14 : 16,
              color: "#555"
            }}>
              {criterion}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: isMobile ? 15 : 16, 
          marginBottom: 8,
          color: "#1a2233"
        }}>
          Exclusion Criteria
        </div>
        <ul style={{ margin: "0 0 0 20px", paddingLeft: 0 }}>
          {cohort.exclusion_criteria.map((criterion, index) => (
            <li key={index} style={{ 
              marginBottom: "6px",
              fontSize: isMobile ? 14 : 16,
              color: "#555"
            }}>
              {criterion}
            </li>
          ))}
        </ul>
      </div>

      {cohort.estimated_pool_size && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: isMobile ? 15 : 16, 
            marginBottom: 6,
            color: "#1a2233"
          }}>
            Estimated Pool Size
          </div>
          <div style={{ 
            fontSize: isMobile ? 14 : 16,
            color: "#555"
          }}>
            {cohort.estimated_pool_size}
          </div>
        </div>
      )}

      {cohort.recruitment_notes && (
        <div style={{ marginBottom: 0 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: isMobile ? 15 : 16, 
            marginBottom: 6,
            color: "#1a2233"
          }}>
            Recruitment Notes
          </div>
          <div style={{ 
            fontSize: isMobile ? 14 : 16,
            color: "#555"
          }}>
            {cohort.recruitment_notes}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowPane({
  current,
  onStepClick,
  isMobile,
  result,
  survey,
  cohort,
}: {
  current: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
  isMobile: boolean;
  result: SurveySpec | null;
  survey: Survey | null;
  cohort: Cohort | null;
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
        const disabled = 
          (step.key === "survey" && !result) ||
          (step.key === "cohort" && !survey) ||
          (step.key === "distribution" && !cohort) ||
          (step.key === "analysis" && !cohort);
        return (
          <button
            key={step.key}
            onClick={() => !disabled && onStepClick(step.key as WorkflowStep)}
            disabled={disabled}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "flex-start",
              background: active ? "#1a2233" : "#f6f8fa",
              color: active ? "#fff" : disabled ? "#999" : "#1a2233",
              border: "none",
              borderRadius: 8,
              padding: isMobile ? "8px 6px" : "10px 12px",
              margin: isMobile ? "0 2px" : 0,
              fontWeight: active ? 700 : 500,
              fontSize: isMobile ? 13 : 15,
              cursor: disabled ? "not-allowed" : "pointer",
              width: isMobile ? "100%" : "100%",
              marginBottom: isMobile ? 0 : 6,
              outline: active ? "2px solid #1a2233" : undefined,
              transition: "background 0.15s, color 0.15s",
              boxShadow: active ? "0 2px 8px rgba(26,34,51,0.08)" : undefined,
              opacity: disabled ? 0.6 : 1,
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

function WorkflowStepComponent({
  title,
  isActive,
  isCompleted,
  onClick,
  disabled = false,
  isMobile,
}: {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  disabled?: boolean;
  isMobile: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: isActive ? "#1a2233" : isCompleted ? "#f0f9ff" : "#f6f8fa",
        color: isActive ? "#fff" : isCompleted ? "#0066cc" : disabled ? "#999" : "#1a2233",
        border: isActive ? "2px solid #1a2233" : isCompleted ? "2px solid #0066cc" : "2px solid #e1e4e8",
        borderRadius: 8,
        padding: isMobile ? "8px 12px" : "10px 16px",
        fontSize: isMobile ? 13 : 14,
        fontWeight: isActive || isCompleted ? 600 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {title}
    </button>
  );
}

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SurveySpec | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [changes, setChanges] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("framing");
  const [questionChanges, setQuestionChanges] = useState("");
  const [updateQuestionsLoading, setUpdateQuestionsLoading] = useState(false);
  const [updateQuestionsError, setUpdateQuestionsError] = useState<string | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loadingCohort, setLoadingCohort] = useState(false);
  const [cohortChanges, setCohortChanges] = useState("");
  const [updateCohortLoading, setUpdateCohortLoading] = useState(false);
  const [updateCohortError, setUpdateCohortError] = useState<string | null>(null);
  const isMobile = useResponsive();

  // Reset state if user goes back to framing
  React.useEffect(() => {
    if (currentStep === "framing") {
      setResult(null);
      setSurvey(null);
      setError(null);
      setUpdateError(null);
      setLoading(false);
      setLoadingSurvey(false);
      setUpdateLoading(false);
      setChanges("");
      setQuestionChanges("");
      setUpdateQuestionsLoading(false);
      setUpdateQuestionsError(null);
      setCohort(null);
      setLoadingCohort(false);
      setCohortChanges("");
      setUpdateCohortLoading(false);
      setUpdateCohortError(null);
    }
  }, [currentStep]);

  // Generate survey questions when moving to survey step (only after approval)
  React.useEffect(() => {
    if (currentStep === "survey" && result && !survey && !loadingSurvey) {
      generateSurveyQuestions();
    }
  }, [currentStep, result, survey, loadingSurvey]);

  // Generate cohort criteria when moving to cohort step
  React.useEffect(() => {
    if (currentStep === "cohort" && result && !cohort && !loadingCohort) {
      generateCohortCriteria();
    }
  }, [currentStep, result, cohort, loadingCohort]);

  const generateSurveyQuestions = async () => {
    if (!result) return;
    
    setLoadingSurvey(true);
    try {
      const res = await fetch("http://localhost:8000/api/survey/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const surveyData: Survey = await res.json();
      setSurvey(surveyData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error generating questions");
    } finally {
      setLoadingSurvey(false);
    }
  };

  const generateCohortCriteria = async () => {
    if (!result) return;
    
    setLoadingCohort(true);
    try {
      const res = await fetch("http://localhost:8000/api/cohort/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const cohortData: Cohort = await res.json();
      setCohort(cohortData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error generating cohort criteria");
    } finally {
      setLoadingCohort(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setSurvey(null);
    setError(null);
    setUpdateError(null);
    try {
      const res = await fetch("http://localhost:8000/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data: SurveySpec = await res.json();
      setResult(data);
      // Stay on framing step - don't auto-advance
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSpec = async () => {
    if (!result || !changes.trim()) return;
    
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const res = await fetch("http://localhost:8000/api/survey/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_spec: result,
          changes,
        }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data: SurveySpec = await res.json();
      setResult(data);
      setChanges("");
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleApprove = () => {
    setCurrentStep("survey");
  };

  const handleUpdateQuestions = async () => {
    if (!result || !survey || !questionChanges.trim()) return;
    
    setUpdateQuestionsLoading(true);
    setUpdateQuestionsError(null);
    try {
      const res = await fetch("http://localhost:8000/api/survey/questions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_spec: result,
          survey: survey,
          changes: questionChanges,
        }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data: Survey = await res.json();
      setSurvey(data);
      setQuestionChanges("");
    } catch (err: unknown) {
      setUpdateQuestionsError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setUpdateQuestionsLoading(false);
    }
  };

  const handleApproveSurvey = () => {
    setCurrentStep("cohort");
  };

  const handleUpdateCohort = async () => {
    if (!result || !cohort || !cohortChanges.trim()) return;
    
    setUpdateCohortLoading(true);
    setUpdateCohortError(null);
    try {
      const res = await fetch("http://localhost:8000/api/cohort/criteria/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_spec: result,
          cohort: cohort,
          changes: cohortChanges,
        }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data: Cohort = await res.json();
      setCohort(data);
      setCohortChanges("");
    } catch (err: unknown) {
      setUpdateCohortError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setUpdateCohortLoading(false);
    }
  };

  const handleApproveCohort = () => {
    setCurrentStep("distribution");
  };

  // Main content for each step
  let mainContent: React.ReactNode = null;
  if (currentStep === "framing") {
    mainContent = (
      <div>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            padding: isMobile ? 14 : 28,
            marginBottom: isMobile ? 18 : 32,
            width: "100%",
            maxWidth: isMobile ? "100%" : 900,
            marginLeft: "auto",
            marginRight: "auto",
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

        {/* Show spec and edit/approve interface after generation */}
        {result && (
          <div>
            <SurveyView spec={result} />
            
            {/* Edit and Approve interface */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: isMobile ? 16 : 28,
                marginTop: 16,
                maxWidth: isMobile ? "100%" : 900,
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <label style={{ 
                fontWeight: 500, 
                fontSize: isMobile ? 15 : 18,
                display: "block",
                marginBottom: 8,
              }}>
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
              
              <div style={{
                display: "flex",
                gap: 12,
                justifyContent: isMobile ? "stretch" : "flex-end",
                marginTop: 16,
              }}>
                <button
                  type="button"
                  onClick={handleUpdateSpec}
                  disabled={updateLoading || !changes.trim()}
                  style={{
                    background: "#1a2233",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 6,
                    padding: isMobile ? "8px 14px" : "10px 22px",
                    fontSize: isMobile ? 14 : 16,
                    cursor: updateLoading || !changes.trim() ? "not-allowed" : "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "background 0.2s",
                    opacity: updateLoading || !changes.trim() ? 0.7 : 1,
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  {updateLoading ? "Updating..." : "Update"}
                </button>
                
                <button
                  type="button"
                  onClick={handleApprove}
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
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  Approve
                </button>
              </div>
              
              {updateError && (
                <div style={{
                  color: "#b00020",
                  marginTop: 10,
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 15,
                }}>
                  Error: {updateError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } else if (currentStep === "survey") {
    mainContent = (
      <div>
        {loadingSurvey ? (
          <div style={{
            textAlign: "center",
            padding: isMobile ? 20 : 40,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            maxWidth: isMobile ? "100%" : 900,
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
            boxSizing: "border-box",
          }}>
            <div style={{ fontSize: isMobile ? 16 : 18, marginBottom: 8 }}>
              Generating survey questions...
            </div>
            <div style={{ fontSize: isMobile ? 13 : 14, color: "#666" }}>
              This may take a moment
            </div>
          </div>
        ) : survey ? (
          <div>
            {/* Survey Spec Box */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: isMobile ? 16 : 28,
                marginBottom: 16,
                maxWidth: isMobile ? "100%" : 900,
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px 0", 
                fontSize: isMobile ? 16 : 18,
                fontWeight: 600,
                color: "#1a2233",
              }}>
                Survey Specification
              </h3>
              <SurveyView spec={result!} />
            </div>
            
            {/* Survey Questions Box */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: isMobile ? 16 : 28,
                maxWidth: isMobile ? "100%" : 900,
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px 0", 
                fontSize: isMobile ? 16 : 18,
                fontWeight: 600,
                color: "#1a2233",
              }}>
                Generated Questions
              </h3>
              <SurveyQuestionsView survey={survey} />
            </div>
            
            {/* Edit Questions Interface */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: isMobile ? 16 : 28,
                marginTop: 16,
                maxWidth: isMobile ? "100%" : 900,
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <label style={{ 
                fontWeight: 500, 
                fontSize: isMobile ? 15 : 18,
                display: "block",
                marginBottom: 8,
              }}>
                Edit Questions:
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
                  placeholder="Suggest changes to the survey questions..."
                  value={questionChanges}
                  onChange={(e) => setQuestionChanges(e.target.value)}
                />
              </label>
              
              <div style={{
                display: "flex",
                gap: 12,
                justifyContent: isMobile ? "stretch" : "flex-end",
                marginTop: 16,
              }}>
                <button
                  type="button"
                  onClick={handleUpdateQuestions}
                  disabled={updateQuestionsLoading || !questionChanges.trim()}
                  style={{
                    background: "#1a2233",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 6,
                    padding: isMobile ? "8px 14px" : "10px 22px",
                    fontSize: isMobile ? 14 : 16,
                    cursor: updateQuestionsLoading || !questionChanges.trim() ? "not-allowed" : "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "background 0.2s",
                    opacity: updateQuestionsLoading || !questionChanges.trim() ? 0.7 : 1,
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  {updateQuestionsLoading ? "Updating..." : "Update Questions"}
                </button>
                
                <button
                  type="button"
                  onClick={handleApproveSurvey}
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
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  Approve
                </button>
              </div>
              
              {updateQuestionsError && (
                <div style={{
                  color: "#b00020",
                  marginTop: 10,
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 15,
                }}>
                  Error: {updateQuestionsError}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  } else if (currentStep === "cohort") {
    mainContent = (
      <div>
        {loadingCohort ? (
          <div style={{
            textAlign: "center",
            padding: isMobile ? 20 : 40,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            maxWidth: isMobile ? "100%" : 900,
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
            boxSizing: "border-box",
          }}>
            <div style={{ fontSize: isMobile ? 16 : 18, marginBottom: 8 }}>
              Generating cohort selection criteria...
            </div>
            <div style={{ fontSize: isMobile ? 13 : 14, color: "#666" }}>
              This may take a moment
            </div>
          </div>
        ) : cohort ? (
          <div>
            {/* Survey Audience Box */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: isMobile ? 16 : 28,
                marginBottom: 16,
                maxWidth: isMobile ? "100%" : 900,
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px 0", 
                fontSize: isMobile ? 16 : 18,
                fontWeight: 600,
                color: "#1a2233",
              }}>
                Survey Audience
              </h3>
              <div style={{
                fontSize: isMobile ? 15 : 17,
                color: "#555",
                padding: isMobile ? 12 : 16,
                background: "#f8f9fa",
                borderRadius: 8,
                border: "1px solid #e1e4e8"
              }}>
                <strong>Target Audience:</strong> {result?.target_audience}
              </div>
            </div>
            
            {/* Cohort Criteria Box */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: isMobile ? 16 : 28,
                maxWidth: isMobile ? "100%" : 900,
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px 0", 
                fontSize: isMobile ? 16 : 18,
                fontWeight: 600,
                color: "#1a2233",
              }}>
                Generated Cohort Criteria
              </h3>
              <CohortView cohort={cohort} />
            </div>
            
            {/* Edit Cohort Interface */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: isMobile ? 16 : 28,
                marginTop: 16,
                maxWidth: isMobile ? "100%" : 900,
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <label style={{ 
                fontWeight: 500, 
                fontSize: isMobile ? 15 : 18,
                display: "block",
                marginBottom: 8,
              }}>
                Edit Cohort Criteria:
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
                  placeholder="Suggest changes to the cohort selection criteria..."
                  value={cohortChanges}
                  onChange={(e) => setCohortChanges(e.target.value)}
                />
              </label>
              
              <div style={{
                display: "flex",
                gap: 12,
                justifyContent: isMobile ? "stretch" : "flex-end",
                marginTop: 16,
              }}>
                <button
                  type="button"
                  onClick={handleUpdateCohort}
                  disabled={updateCohortLoading || !cohortChanges.trim()}
                  style={{
                    background: "#1a2233",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 6,
                    padding: isMobile ? "8px 14px" : "10px 22px",
                    fontSize: isMobile ? 14 : 16,
                    cursor: updateCohortLoading || !cohortChanges.trim() ? "not-allowed" : "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "background 0.2s",
                    opacity: updateCohortLoading || !cohortChanges.trim() ? 0.7 : 1,
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  {updateCohortLoading ? "Updating..." : "Update Criteria"}
                </button>
                
                <button
                  type="button"
                  onClick={handleApproveCohort}
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
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  Approve
                </button>
              </div>
              
              {updateCohortError && (
                <div style={{
                  color: "#b00020",
                  marginTop: 10,
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 15,
                }}>
                  Error: {updateCohortError}
                </div>
              )}
            </div>
          </div>
        ) : null}
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
          maxWidth: isMobile ? "100%" : 900,
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: 24,
          fontSize: isMobile ? 20 : 24,
          color: "#1a2233"
        }}>
          Distribution Options
        </h2>
        <p style={{ 
          color: "#555", 
          fontSize: isMobile ? 15 : 17,
          marginBottom: 32,
          lineHeight: 1.5
        }}>
          Choose how you'd like to distribute your survey and collect responses.
        </p>
        
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          {/* Social Media Distribution - Disabled */}
          <button
            disabled={true}
            style={{
              background: "#f6f8fa",
              color: "#6a737d",
              border: "2px solid #e1e4e8",
              borderRadius: 12,
              padding: isMobile ? "20px 16px" : "24px 20px",
              fontSize: isMobile ? 16 : 18,
              fontWeight: 600,
              cursor: "not-allowed",
              opacity: 0.6,
              textAlign: "left",
              transition: "all 0.2s",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ marginBottom: 6 }}>
                📱 Distribute on Social Media
              </div>
              <div style={{ 
                fontSize: isMobile ? 13 : 14, 
                fontWeight: 400,
                color: "#8a8a8a"
              }}>
                Share your survey on Facebook, Twitter, LinkedIn, and other platforms
              </div>
            </div>
            <div style={{ 
              fontSize: isMobile ? 12 : 13,
              background: "#e1e4e8",
              color: "#6a737d",
              padding: "4px 8px",
              borderRadius: 4,
              fontWeight: 500
            }}>
              Coming Soon
            </div>
          </button>

          {/* Email Distribution - Disabled */}
          <button
            disabled={true}
            style={{
              background: "#f6f8fa",
              color: "#6a737d",
              border: "2px solid #e1e4e8",
              borderRadius: 12,
              padding: isMobile ? "20px 16px" : "24px 20px",
              fontSize: isMobile ? 16 : 18,
              fontWeight: 600,
              cursor: "not-allowed",
              opacity: 0.6,
              textAlign: "left",
              transition: "all 0.2s",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ marginBottom: 6 }}>
                📧 Distribute via Email
              </div>
              <div style={{ 
                fontSize: isMobile ? 13 : 14, 
                fontWeight: 400,
                color: "#8a8a8a"
              }}>
                Send survey invitations directly to email addresses
              </div>
            </div>
            <div style={{ 
              fontSize: isMobile ? 12 : 13,
              background: "#e1e4e8",
              color: "#6a737d",
              padding: "4px 8px",
              borderRadius: 4,
              fontWeight: 500
            }}>
              Coming Soon
            </div>
          </button>

          {/* Generate Synthetic Data - Active */}
          <button
            onClick={() => {
              // TODO: Implement synthetic data generation
              console.log("Generate synthetic data clicked");
            }}
            style={{
              background: "#1a2233",
              color: "#fff",
              border: "2px solid #1a2233",
              borderRadius: 12,
              padding: isMobile ? "20px 16px" : "24px 20px",
              fontSize: isMobile ? 16 : 18,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(26,34,51,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0f1419";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,34,51,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1a2233";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,34,51,0.1)";
            }}
          >
            <div>
              <div style={{ marginBottom: 6 }}>
                🔬 Generate Synthetic Data
              </div>
              <div style={{ 
                fontSize: isMobile ? 13 : 14, 
                fontWeight: 400,
                color: "#e6e8ea"
              }}>
                Create realistic synthetic survey responses for testing and analysis
              </div>
            </div>
            <div style={{ 
              fontSize: isMobile ? 12 : 13,
              background: "#2e7d32",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 4,
              fontWeight: 500
            }}>
              Available
            </div>
          </button>
        </div>

        <div style={{
          marginTop: 24,
          padding: isMobile ? 12 : 16,
          background: "#f0f9ff",
          border: "1px solid #b3d9ff",
          borderRadius: 8,
          fontSize: isMobile ? 13 : 14,
          color: "#0066cc",
        }}>
          <strong>💡 Tip:</strong> Synthetic data generation allows you to test your survey design and analysis workflows before collecting real responses.
        </div>
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
            result={result}
            survey={survey}
            cohort={cohort}
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
