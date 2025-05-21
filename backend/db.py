import psycopg2
from psycopg2.extras import RealDictCursor, Json
from dotenv import load_dotenv
import os
from models.survey import SurveySpec
from models.artifact import Artifact

# Load environment variables from .env
load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")


class SurveyKongDB:
    def __init__(self):
        self.conn = psycopg2.connect(
            user=USER, password=PASSWORD, host=HOST, port=PORT, dbname=DBNAME
        )

    def close(self):
        self.conn.close()

    def create_project(self, data):
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO projects (data) VALUES (%s) RETURNING id, data, created_at;
                """,
                (Json(data),),
            )
            self.conn.commit()
            return cur.fetchone()

    def get_projects(self):
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, data, created_at FROM projects ORDER BY created_at DESC;"
            )
            return cur.fetchall()

    def create_survey_spec(self, project_id: str, data: SurveySpec):
        # Accepts SurveySpec, Artifact[SurveySpec], or dict
        if isinstance(data, Artifact):
            data = data.to_dict()
        elif isinstance(data, SurveySpec):
            data = data.model_dump()
        # else assume dict
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO survey_specs (project_id, data) VALUES (%s, %s) RETURNING id, project_id, data, created_at;
                """,
                (project_id, Json(data)),
            )
            self.conn.commit()
            return cur.fetchone()

    def get_survey_specs_for_project(self, project_id):
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, project_id, data, created_at FROM survey_specs WHERE project_id = %s ORDER BY created_at DESC;",
                (project_id,),
            )
            return cur.fetchall()
