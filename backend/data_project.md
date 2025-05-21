# SurveyKong Database & Storage Architecture (Minimal JSONB Schema)

## Technology Recommendation

SurveyKong uses **Supabase** as the backend storage solution for rapid prototyping and flexible schema evolution. Supabase provides a managed PostgreSQL database, authentication, and RESTful API access, making it ideal for fast iteration.

## Minimal Data Model

To maximize flexibility and minimize migration overhead, the initial schema uses only two tables, each with a JSONB column for all data:

### 1. Projects

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  created_at timestamp with time zone default now()
);
```

- **Purpose:** Stores all project-level information in the `data` JSONB column.
- **Example `data`:** `{ "title": "Customer Feedback", "description": "Q2 survey", "status": "draft" }`

### 2. Survey Specs

```sql
create table survey_specs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamp with time zone default now()
);
```

- **Purpose:** Stores all survey specification details in the `data` JSONB column, and links to a project via `project_id`.
- **Example `data`:** `{ "questions": [...], "target_audience": "US adults", "version": 1 }`

## Implementation Strategy

### 1. Supabase Setup

- Create a new Supabase project.
- Run the above SQL in the Supabase SQL editor to create the tables.

### 2. Python Integration Example

- Use the `postgrest-py` library to interact with Supabase from Python.
- Example: Insert a project, then insert a survey spec linked to that project.

```python
from postgrest import PostgrestClient
import os

client = PostgrestClient(f"{os.getenv('SUPABASE_URL')}/rest/v1", headers={
    "apikey": os.getenv('SUPABASE_KEY'),
    "Authorization": f"Bearer {os.getenv('SUPABASE_KEY')}"
})

# Insert a project
data = {"title": "My Project", "description": "Demo", "status": "draft"}
project_resp = client.table("projects").insert({"data": data}).execute()
project_id = project_resp.data[0]["id"]

# Insert a survey spec linked to the project
spec_data = {"questions": [], "target_audience": "US adults", "version": 1}
spec_resp = client.table("survey_specs").insert({"project_id": project_id, "data": spec_data}).execute()
```

### 3. Evolving the Schema

- Add new fields to the `data` JSONB in your code as needed—no migrations required.
- When the data model stabilizes, you can add more structure or indexes as needed.

## Next Steps

1. Apply the schema in Supabase.
2. Use Python (or any language) to read/write JSONB data.
3. Iterate on your data model in code for maximum speed.
4. Add more structure or tables only when needed for performance or integrity.

## Benefits

- **Maximum flexibility:** Change your data model in code, not migrations.
- **Rapid prototyping:** Add/remove fields as needed.
- **Simple integration:** Python dicts map directly to JSONB.

## Future Considerations

- Add indexes on important JSONB keys for performance.
- Add more tables or columns as your needs grow.
- Implement Row Level Security (RLS) and API security as you move toward production.
