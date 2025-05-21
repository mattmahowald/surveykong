from agents.agent import Agent
from models.artifact import Artifact
from agents.outbound import OutboundResults


class AnalysisReport(Artifact):
    def __init__(self):
        super().__init__()


class AnalysisAgent(Agent):
    def __init__(self):
        super().__init__()

    def run(self, results: OutboundResults) -> AnalysisReport:
        print("Running analysis agent")
        return AnalysisReport()
