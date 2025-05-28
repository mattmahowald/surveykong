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

// Project type for API integration
interface Project {
  id: string;
  created_at: string;
  data: {
    title: string;
    description: string;
    status?: string;
    workflow_stage?: string;
    [key: string]: unknown;
  };
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

// Sidebar for project list and creation
function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelect,
  onCreate,
  isMobile,
}: {
  projects: Project[];
  selectedProjectId: string | null;
  onSelect: (id: string) => void;
  onCreate: (title: string, description: string) => Promise<void>;
  isMobile: boolean;
}) {
  const [showModal, setShowModal] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await onCreate(title, description);
      setShowModal(false);
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: isMobile ? 10 : 20,
        margin: isMobile ? "0 0 12px 0" : "0 32px 0 0",
        width: isMobile ? "100%" : 260,
        minWidth: isMobile ? undefined : 200,
        maxHeight: isMobile ? 180 : "calc(100vh - 48px)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
      aria-label="Project list"
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <span
          style={{ fontWeight: 700, fontSize: isMobile ? 16 : 20, flex: 1 }}
        >
          Projects
        </span>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "#1a2233",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: isMobile ? "4px 10px" : "6px 14px",
            fontSize: isMobile ? 13 : 15,
            fontWeight: 600,
            cursor: "pointer",
            marginLeft: 8,
          }}
          aria-label="Create new project"
        >
          + Create
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {projects.length === 0 ? (
          <div
            style={{
              color: "#888",
              fontSize: isMobile ? 14 : 15,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No projects yet.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => onSelect(p.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background:
                      p.id === selectedProjectId ? "#1a2233" : "#f6f8fa",
                    color: p.id === selectedProjectId ? "#fff" : "#1a2233",
                    border: "none",
                    borderRadius: 6,
                    padding: isMobile ? "7px 8px" : "10px 12px",
                    marginBottom: 6,
                    fontWeight: p.id === selectedProjectId ? 700 : 500,
                    fontSize: isMobile ? 14 : 15,
                    cursor: "pointer",
                    outline:
                      p.id === selectedProjectId
                        ? "2px solid #1a2233"
                        : undefined,
                    transition: "background 0.15s, color 0.15s",
                  }}
                  aria-current={p.id === selectedProjectId ? "true" : undefined}
                >
                  <div style={{ fontWeight: 600 }}>
                    {p.data.title || "Untitled"}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: p.id === selectedProjectId ? "#e0e0e0" : "#666",
                    }}
                  >
                    {p.data.description || "No description"}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: p.id === selectedProjectId ? "#c0c0c0" : "#aaa",
                    }}
                  >
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
            style={{
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
              padding: 24,
              minWidth: 280,
              maxWidth: 340,
              width: "90vw",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
              Create Project
            </div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                fontSize: 15,
                padding: "7px 10px",
                borderRadius: 6,
                border: "1px solid #d0d7de",
                marginBottom: 4,
              }}
              autoFocus
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                fontSize: 14,
                padding: "7px 10px",
                borderRadius: 6,
                border: "1px solid #d0d7de",
                resize: "vertical",
                marginBottom: 4,
              }}
            />
            {error && (
              <div style={{ color: "#b00020", fontSize: 13 }}>{error}</div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  background: "#eee",
                  color: "#333",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 0",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  flex: 1,
                  background: "#1a2233",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 0",
                  fontWeight: 600,
                  cursor: creating ? "not-allowed" : "pointer",
                }}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
}

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SurveySpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("framing");
  const isMobile = useResponsive();

  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  // Reset state if user goes back to framing
  React.useEffect(() => {
    if (currentStep === "framing") {
      setResult(null);
      setError(null);
      setLoading(false);
    }
  }, [currentStep]);

  // Fetch projects on mount
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/projects");
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        let data: Project[] = await res.json();
        // Sort by created_at descending
        data = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setProjects(data);
        // Auto-select most recent if none selected
        if (!selectedProjectId && data.length > 0)
          setSelectedProjectId(data[0].id);
      } catch {
        // No-op for now; could add error UI if desired
      }
    };
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create project handler
  const handleCreateProject = async (title: string, description: string) => {
    const res = await fetch("http://localhost:8000/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        status: "draft",
        workflow_stage: "framing",
      }),
    });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const newProject: Project = await res.json();
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
  };

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
        {/* Project Sidebar */}
        <div
          style={{
            width: isMobile ? "100%" : 260,
            minWidth: isMobile ? undefined : 200,
          }}
        >
          <ProjectSidebar
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={setSelectedProjectId}
            onCreate={handleCreateProject}
            isMobile={isMobile}
          />
        </div>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>{mainContent}</div>
        {/* Workflow Pane */}
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
