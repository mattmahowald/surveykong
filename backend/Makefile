install:
	poetry install

run:
	poetry run python main.py

test:
	poetry run pytest

clean:
	rm -rf __pycache__ .pytest_cache

serve:
	poetry run uvicorn api:app --reload 
