# SurveyKong Backend

A Python-based backend system for automating the survey research process, from research question to data analysis.

## Overview

SurveyKong helps you automate the survey research process by orchestrating multiple specialized agents that each handle a specific part of the workflow:

1. Input & Framing - Turning research questions into structured specifications
2. Survey Construction - Creating effective survey questions and structure
3. Cohort Creation - Selecting the right respondent audience
4. Survey Distribution & Data Collection - Sending surveys and collecting responses
5. Results Processing - Cleaning and validating survey data
6. Analysis & Reporting - Interpreting results and generating insights

## Architecture

The system follows an agent-based architecture with a main orchestrator coordinating the workflow:

- **SurveyOrchestrator**: Manages the entire process flow
- **Agent System**: Each specialized task is handled by a dedicated agent:
  - **SpecAgent**: Defines research specifications based on your research question
  - **SurveyAgent**: Creates the survey structure and questions
  - **CohortAgent**: Determines the appropriate audience for the survey
  - **OutboundAgent**: Handles survey distribution and response collection
  - **AnalysisAgent**: Processes and analyzes survey results

### Detailed Agent Responsibilities

1. **SpecAgent (Input & Framing)**

   - Converts loose user input into a structured research brief
   - Fills gaps in logic, surfaces potential confounds, flags unclear hypotheses
   - Outputs a structured design spec (e.g., JSON) representing the research frame

2. **SurveyAgent (Survey Construction)**

   - Generates an initial survey draft following best practices for clarity and validity
   - May reference sub-agents for Likert design, attention checks, and psychometric validation
   - Enables iterative feedback from users to refine questions

3. **CohortAgent (Cohort Creation)**

   - Translates sampling requirements into platform-compatible queries
   - Handles inclusion criteria: age, geography, profession, income, etc.
   - Optimizes for tradeoffs between audience precision and cost

4. **OutboundAgent (Survey Distribution)**

   - Interfaces with survey platforms via APIs (e.g., MTurk, Prolific, FB Ads)
   - Manages the data collection process

5. **AnalysisAgent (Results Processing & Analysis)**
   - Cleans, normalizes, and validates data
   - Removes low-quality responses based on timing, consistency, or attention checks
   - Conducts appropriate statistical analysis (means testing, regression, clustering)
   - Translates statistical output into plain-language insights
   - Generates final reports with visualizations and executive summaries

## Installation

### Prerequisites

- Python 3.13.0
- Poetry (for dependency management)

### Setup

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
poetry install
```

4. Create a `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

## Usage

Run the main script:

```bash
python main.py
```

You will be prompted to enter your research question, and the system will orchestrate the entire survey process.

## Project Structure

```
backend/
├── .env                  # Environment variables (API keys)
├── __init__.py           # Package initialization
├── agents/               # Agent modules
│   ├── __init__.py
│   ├── agent.py          # Base agent class
│   ├── analysis.py       # Results analysis agent
│   ├── cohort.py         # Survey audience selection agent
│   ├── outbound.py       # Survey distribution agent
│   ├── spec.py           # Research spec creation agent
│   └── survey.py         # Survey creation agent
├── main.py               # Application entry point
├── orchestrate.py        # Orchestration logic
├── poetry.lock           # Poetry lock file
└── pyproject.toml        # Project metadata and dependencies
```

## Dependencies

- openai (>=1.77.0) - For AI agent functionality
- python-dotenv (1.0.1) - For environment variable management
- poetry (1.8.4) - For package management

## Development Status

This project is currently in early development. The agent structure is in place, but the implementations are minimal. Each agent currently returns placeholder objects. We aim to develop specialized agents across the research workflow to answer the question: Can an agentic survey platform match human performance across survey development, cohort creation, and results analysis?

## License

[Add your license information here]

## Authors

Matt Mahowald (mahowaldmatt@gmail.com)
B. Zwanenburg
