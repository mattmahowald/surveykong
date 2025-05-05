from agents.agent import Agent, Artifact


class Spec(Artifact):
    def __init__(self):
        super().__init__()


class SpecAgent(Agent):
    def __init__(self):
        super().__init__()

    def run(self, survey_request: str) -> Spec:
        print("Running spec agent")
        return Spec()
