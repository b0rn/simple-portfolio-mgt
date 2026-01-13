# Backend
This backend is written in Python. It uses FastAPI and SQLAlchemy.

## Init
First, install the dependencies with  `pip install -r requirements.txt`.

## Usage
To run the server, use `fastapi dev src/main.py`.

### Custom Environment File
To specify a custom environment file location, you can use the `ENV_FILE` environment variable:
`ENV_FILE=path/to/your/.env fastapi dev src/main.py`