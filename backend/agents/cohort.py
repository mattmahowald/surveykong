from agents.agent import Agent, Artifact
from agents.survey import Survey


class Cohort(Artifact):
    def __init__(self):
        super().__init__()


class CohortAgent(Agent):
    def __init__(self):
        super().__init__()

    def run(self, survey: Survey) -> Cohort:
        print("Running cohort agent")
        return Cohort()
