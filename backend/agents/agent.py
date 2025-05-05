from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()


class Artifact:
    def __init__(self):
        pass


class Agent:
    SYSTEM_PROMPT = "NOT IMPLEMENTED"

    def __init__(self):
        pass

    def run(self, *args) -> Artifact:
        pass
