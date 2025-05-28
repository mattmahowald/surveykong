# SurveyKong Context

## Project Overview

SurveyKong is a Python-based backend system for automating the survey research process, from research question to data analysis. The system uses an agent-based architecture to handle different aspects of the survey workflow.

## Architecture

### Core Components

1. **Base Agent System**

   - Generic `Agent` class with robust error handling and metrics tracking
   - Circuit breaker pattern for API call management
   - Support for both synchronous and asynchronous operations
   - Structured output handling with Pydantic models
   - Tool system for extensible agent capabilities

2. **Agent Types**

   - `SpecAgent`: Converts research questions into structured specifications
   - `SurveyAgent`: Creates survey structure and questions
   - `CohortAgent`: Determines target audience
   - `OutboundAgent`: Handles survey distribution
   - `AnalysisAgent`: Processes and analyzes results

3. **Data Models**
   - `Question`: Represents survey questions with types (multiple_choice, text, rating, boolean)
   - `SurveySpec`: Defines survey structure and requirements
   - `Artifact`: Base class for all agent outputs with metadata and metrics

### Key Features

1. **Error Handling & Resilience**

   - Circuit breaker pattern for API calls
   - Retry logic with exponential backoff
   - Comprehensive error tracking and metrics

2. **Metrics & Monitoring**

   - API call tracking
   - Token usage monitoring
   - Execution time measurement
   - Error rate tracking

3. **Structured Output**
   - JSON schema validation
   - Pydantic model integration
   - Type-safe data handling

## Technical Stack

### Dependencies

- Python 3.13.0
- OpenAI API (>=1.77.0)
- Poetry (1.8.4) for dependency management
- python-dotenv (1.0.1) for environment configuration

### Project Structure

```
backend/
├── agents/
│   ├── agent.py          # Base agent implementation
│   ├── spec.py           # Survey specification agent
│   ├── survey.py         # Survey creation agent
│   ├── cohort.py         # Audience selection agent
│   ├── outbound.py       # Distribution agent
│   └── analysis.py       # Results analysis agent
├── main.py               # Application entry point
├── orchestrate.py        # Workflow orchestration
└── pyproject.toml        # Project configuration
```

## Recent Updates

### Agent System Enhancements

1. Implemented robust base Agent class with:

   - Async/sync operation support
   - Circuit breaker pattern
   - Metrics tracking
   - Tool system
   - Structured output handling

2. Enhanced SpecAgent with:
   - JSON schema validation
   - Structured survey specification output
   - Error handling and recovery
   - Metrics tracking

### API Integration

1. Updated OpenAI integration:
   - Upgraded to OpenAI API v1.77.0
   - Added structured output support
   - Implemented proper error handling
   - Added token usage tracking

### Development Status

The project is in active development with the following status:

- ✅ Base agent system implemented
- ✅ SpecAgent fully functional
- 🚧 Other agents in development
- 🚧 Full orchestration pending

## Next Steps

1. Complete implementation of remaining agents
2. Implement full orchestration workflow
3. Add comprehensive testing
4. Enhance error handling and recovery
5. Add more sophisticated metrics and monitoring

## Developer Utilities

A Makefile is provided for common development tasks:

- `make install` — Install dependencies with Poetry
- `make run` — Run the CLI main script
- `make serve` — Serve the FastAPI API with uvicorn
- `make test` — Run tests (currently a placeholder)
- `make clean` — Remove Python and pytest caches
