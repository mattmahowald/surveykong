# SurveyKong Backend - Project Context

## Project Overview
**SurveyKong**: AI-powered survey automation platform that orchestrates the entire survey lifecycle from research question to data analysis.

## Tech Stack (STRICT REQUIREMENTS)

### Core Dependencies
- **Python**: 3.11+ (tested on 3.13.0)
- **Pydantic**: v2.10+ (NOT v1) - Use `model_dump()`, `model_validate()`, NOT `.dict()`, `.parse_obj()`
- **Supabase**: v2.10+ via `supabase` package (NOT `postgrest-py` which only supports Pydantic v1)
- **OpenAI**: v1.77+ for agent intelligence
- **FastAPI**: v0.115+ for API endpoints
- **PostgreSQL**: via `psycopg2-binary` (NOT `psycopg2`)

### Package Manager
- **Poetry**: Primary package manager
- **pyproject.toml**: Source of truth for dependencies

## Project Structure
```
backend/
├── agents/          # AI agents for each workflow stage
│   ├── agent.py     # Base agent class
│   ├── spec.py      # Research spec creation
│   ├── survey.py    # Survey question generation
│   ├── cohort.py    # Audience selection
│   ├── outbound.py  # Distribution handling
│   └── analysis.py  # Results analysis
├── models/          # Pydantic v2 data models
│   ├── artifact.py  # Generic artifact container
│   └── survey.py    # Survey-specific models
├── orchestrate.py   # Main workflow orchestrator
├── supabase_service.py  # Database operations
├── api.py          # FastAPI endpoints
├── main.py         # CLI entry point
└── tests/          # Test suite
```

## Database Schema (Supabase/PostgreSQL)
```sql
-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey specs table
CREATE TABLE survey_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Critical Setup Instructions

### 1. Environment Variables (.env)
```bash
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
```

### 2. Installation
```bash
# ONLY use this method:
cd backend
poetry install
poetry shell
```

### 3. Running the Application
```bash
# CLI mode
python main.py

# API server
uvicorn api:app --reload --port 8000

# Run tests (unit only)
pytest -m "not integration"
```

## Code Standards

### Pydantic v2 Usage
```python
# CORRECT (v2)
model.model_dump()          # NOT .dict()
model.model_dump_json()     # NOT .json()
Model.model_validate(data)  # NOT .parse_obj()
Model.model_validate_json() # NOT .parse_raw()

# Field validation
@field_validator('email')   # NOT @validator
@model_validator(mode='after')  # NOT @root_validator
```

### Supabase Client Usage
```python
# CORRECT
from supabase import create_client
client = create_client(url, key)
result = client.table("projects").insert(data).execute()

# WRONG (old postgrest-py)
from postgrest import PostgrestClient
```

### Async Patterns
```python
# Supabase v2 is sync by default
# For async, wrap in asyncio.to_thread() or use postgrest directly
async def create_project_async(data):
    def _create():
        return client.table("projects").insert(data).execute()
    return await asyncio.to_thread(_create)
```

## Agent Architecture

### Base Agent Pattern
- Each agent inherits from `BaseAgent`
- Implements `run()` (sync) and `arun()` (async) methods
- Returns `Artifact[T]` with typed data payload
- Uses OpenAI for intelligence

### Agent Responsibilities
1. **SpecAgent**: Research question → Structured specification
2. **SurveyAgent**: Specification → Survey questions
3. **CohortAgent**: Requirements → Audience targeting
4. **OutboundAgent**: Survey → Distribution
5. **AnalysisAgent**: Responses → Insights

### Orchestrator Flow
```python
orchestrator = SurveyOrchestrator(client, async_client)
spec = await orchestrator.run_research_spec(question)
survey = await orchestrator.run_survey_creation(spec)
# ... continues through pipeline
```

## Testing Strategy
- **Unit tests**: Models, business logic (no external deps)
- **Integration tests**: Marked with `@pytest.mark.integration`
- Run: `pytest -m "not integration"` for fast local testing

## Development Workflow
1. Always use Poetry virtual environment
2. Format: `black .` and `isort .`
3. Type check: `mypy .`
4. Test before commit: `pytest -m "not integration"`

## Common Issues & Solutions

### "pydantic v1/v2 conflict"
- NEVER install `postgrest-py` 
- ONLY use `supabase>=2.10.0`

### "Import errors"
- Ensure you're in Poetry shell: `poetry shell`
- Check Python version: `python --version` (must be 3.11+)

### "Supabase connection failed"
- Verify `.env` has correct SUPABASE_URL and SUPABASE_KEY
- Check Supabase dashboard for table creation

## Next Development Steps
1. Implement concrete agent logic (currently stubs)
2. Add Supabase RLS policies for multi-tenant support
3. Implement survey distribution integrations (MTurk, Prolific)
4. Build analysis visualization components
5. Add comprehensive error handling and logging
