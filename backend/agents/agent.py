from typing import (
    Any,
    Dict,
    List,
    Optional,
    TypeVar,
    Generic,
    Callable,
    Awaitable,
    Union,
    Type,
)
from dataclasses import dataclass, field
import asyncio
import logging
import time
from datetime import datetime
from pydantic import BaseModel, Field
from models.artifact import Artifact

T = TypeVar("T")
OutputType = TypeVar("OutputType", bound=BaseModel)


@dataclass
class Tool:
    """Represents a tool that can be used by the agent."""

    name: str
    description: str
    function: Callable[..., Any]
    async_function: Optional[Callable[..., Awaitable[Any]]] = None

    def __post_init__(self):
        # Ensure at least one function is provided
        if self.function is None and self.async_function is None:
            raise ValueError("Either function or async_function must be provided")


class Artifact(BaseModel, Generic[T]):
    """Base class for all artifacts produced by agents."""

    data: Optional[T] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: float = Field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the artifact to a dictionary representation."""
        return self.model_dump()

    def to_json(self) -> str:
        """Convert the artifact to a JSON string."""
        return self.model_dump_json()


class AgentContext(BaseModel):
    """Stores the conversational context and state for an agent."""

    messages: List[Dict[str, str]] = Field(default_factory=list)
    memory: Dict[str, Any] = Field(default_factory=dict)
    artifacts: List[Artifact] = Field(default_factory=list)

    def add_message(self, role: str, content: str) -> None:
        """Add a message to the conversation history."""
        self.messages.append({"role": role, "content": content})

    def add_artifact(self, artifact: Artifact) -> None:
        """Add an artifact to the context."""
        self.artifacts.append(artifact)

    def get_messages(self) -> List[Dict[str, str]]:
        """Get the conversation history."""
        return self.messages.copy()


@dataclass
class AgentMetrics:
    """Tracks metrics for agent execution."""

    start_time: datetime
    end_time: Optional[datetime] = None
    api_calls: int = 0
    tool_calls: int = 0
    tokens_used: int = 0
    errors: List[Dict[str, Any]] = field(default_factory=list)

    def record_api_call(self):
        self.api_calls += 1

    def record_tool_call(self):
        self.tool_calls += 1

    def record_tokens(self, prompt_tokens: int, completion_tokens: int):
        self.tokens_used += prompt_tokens + completion_tokens

    def record_error(self, error: Exception):
        self.errors.append(
            {
                "timestamp": datetime.now(),
                "type": type(error).__name__,
                "message": str(error),
            }
        )

    def finish(self):
        self.end_time = datetime.now()

    def summary(self) -> Dict[str, Any]:
        """Return a summary of metrics."""
        duration = (self.end_time or datetime.now()) - self.start_time
        return {
            "duration_seconds": duration.total_seconds(),
            "api_calls": self.api_calls,
            "tool_calls": self.tool_calls,
            "tokens_used": self.tokens_used,
            "error_count": len(self.errors),
        }


class AgentError(Exception):
    """Base exception for agent-related errors."""

    pass


class CircuitBreaker:
    """Implements the circuit breaker pattern to prevent cascading failures."""

    def __init__(self, failure_threshold: int = 5, reset_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failures = 0
        self.last_failure_time = 0.0
        self.is_open = False

    def record_failure(self):
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.is_open = True

    def can_execute(self) -> bool:
        if not self.is_open:
            return True
        if time.time() - self.last_failure_time > self.reset_timeout:
            self.is_open = False
            self.failures = 0
            return True
        return False

    def reset(self):
        """Reset the circuit breaker."""
        self.failures = 0
        self.is_open = False


class Agent:
    """Base class for all AI agents."""

    # Class constants
    DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant."

    def __init__(
        self,
        client: Any,
        async_client: Any,
        model: str = "gpt-4.1-nano-2025-04-14",
        temperature: float = 0.7,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        rate_limit: Optional[float] = None,
    ):
        # API settings
        self.model = model
        self.temperature = temperature
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.rate_limit = rate_limit

        # Clients
        self.client = client
        self.async_client = async_client

        # State
        self.context = AgentContext()
        self.metrics = AgentMetrics(start_time=datetime.now())
        self.circuit_breaker = CircuitBreaker()
        self.tools: List[Tool] = []
        self.last_request_time = 0.0

    def add_tool(self, tool: Tool) -> None:
        """Add a tool to the agent's toolkit."""
        self.tools.append(tool)

    def get_system_prompt(self) -> str:
        """Get the system prompt for the agent. Override in subclasses."""
        return self.DEFAULT_SYSTEM_PROMPT

    def get_tools_prompt(self) -> str:
        """Get a description of available tools."""
        if not self.tools:
            return "No tools available."

        tool_descriptions = []
        for tool in self.tools:
            tool_descriptions.append(f"- {tool.name}: {tool.description}")
        return "Available tools:\n" + "\n".join(tool_descriptions)

    def _rate_limit(self) -> None:
        """Implement rate limiting if specified."""
        if self.rate_limit:
            current_time = time.time()
            time_since_last = current_time - self.last_request_time
            if time_since_last < self.rate_limit:
                time.sleep(self.rate_limit - time_since_last)
            self.last_request_time = time.time()

    async def _execute_with_retry(
        self, func: Callable[..., Awaitable[Any]], *args: Any, **kwargs: Any
    ) -> Any:
        """Execute a function with retry logic."""
        for attempt in range(self.max_retries):
            try:
                self._rate_limit()
                return await func(*args, **kwargs)
            except Exception as e:
                if attempt == self.max_retries - 1:
                    self.metrics.record_error(e)
                    raise
                logging.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                await asyncio.sleep(self.retry_delay * (attempt + 1))

    async def _call_openai(
        self,
        messages: List[Dict[str, str]],
        output_schema: Optional[Type[OutputType]] = None,
        **kwargs: Any,
    ) -> Any:
        """Make an API call to OpenAI with proper error handling and structured output support."""
        if not self.circuit_breaker.can_execute():
            raise AgentError("Circuit breaker is open - too many failures")

        try:
            self.metrics.record_api_call()

            # If output schema is provided, use structured output format
            if output_schema is not None:
                response = await self.async_client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=self.temperature,
                    **kwargs,
                )

                # Parse the response into the specified schema
                try:
                    output_data = response.choices[0].message.content
                    return output_schema.model_validate_json(output_data)
                except Exception as e:
                    self.metrics.record_error(e)
                    raise AgentError(f"Failed to parse structured output: {str(e)}")
            else:
                # Regular response handling
                response = await self.async_client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=self.temperature,
                    **kwargs,
                )

            # Record token usage if available
            if hasattr(response, "usage"):
                self.metrics.record_tokens(
                    getattr(response.usage, "prompt_tokens", 0),
                    getattr(response.usage, "completion_tokens", 0),
                )

            return response
        except Exception as e:
            self.circuit_breaker.record_failure()
            logging.error(f"OpenAI API call failed: {str(e)}")
            raise

    async def get_structured_output(
        self,
        messages: List[Dict[str, str]],
        output_schema: Type[OutputType],
        **kwargs: Any,
    ) -> OutputType:
        """Get a structured output from the model that conforms to the specified schema."""
        return await self._execute_with_retry(
            self._call_openai, messages=messages, output_schema=output_schema, **kwargs
        )

    async def _execute_tool(self, tool_name: str, **tool_args) -> Any:
        """Execute a tool by name with the given arguments."""
        self.metrics.record_tool_call()

        for tool in self.tools:
            if tool.name == tool_name:
                try:
                    if tool.async_function:
                        return await tool.async_function(**tool_args)
                    return tool.function(**tool_args)
                except Exception as e:
                    self.metrics.record_error(e)
                    raise AgentError(f"Tool '{tool_name}' execution failed: {str(e)}")

        raise AgentError(f"Tool '{tool_name}' not found")

    def run(self, *args: Any, **kwargs: Any) -> Artifact:
        """Synchronous run method that wraps the async implementation."""
        return asyncio.run(self.arun(*args, **kwargs))

    async def pre_execution_hook(self, *args: Any, **kwargs: Any) -> None:
        """Hook for subclasses to implement pre-execution logic."""
        pass

    async def post_execution_hook(self, result: Any, *args: Any, **kwargs: Any) -> None:
        """Hook for subclasses to implement post-execution logic."""
        pass

    async def arun(self, *args: Any, **kwargs: Any) -> Artifact:
        """Asynchronous run method to be implemented by subclasses."""
        try:
            # Reset metrics for this run
            self.metrics = AgentMetrics(start_time=datetime.now())

            # Allow subclasses to perform setup
            await self.pre_execution_hook(*args, **kwargs)

            # Execute agent-specific logic (to be implemented by subclasses)
            result = await self._execute(*args, **kwargs)

            # Allow subclasses to perform cleanup
            await self.post_execution_hook(result, *args, **kwargs)

            # Create the artifact
            artifact = self._create_artifact(result)

            # Complete metrics
            self.metrics.finish()
            artifact.metadata["metrics"] = self.metrics.summary()

            return artifact
        except Exception as e:
            self.metrics.record_error(e)
            self.metrics.finish()
            raise

    async def _execute(self, *args: Any, **kwargs: Any) -> Any:
        """Core execution logic to be implemented by subclasses."""
        raise NotImplementedError("Subclasses must implement _execute method")

    def _create_artifact(self, result: Any) -> Artifact:
        """Create an artifact from the execution result."""
        return Artifact(data=result)
