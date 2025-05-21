from agents.agent import Agent, Artifact
from agents.cohort import Cohort
from agents.survey import Survey
from models.artifact import Artifact


class OutboundResults(Artifact):
    def __init__(self):
        super().__init__()


class OutboundAgent(Agent):
    def __init__(self):
        super().__init__()

    def run(self, survey: Survey, cohort: Cohort) -> OutboundResults:
        print("Running outbound agent")
        return OutboundResults()
