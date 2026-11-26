from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "*"
    ]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/bumblebee_db"

    # Ollama
    OLLAMA_HOST: str = "http://127.0.0.1:11434"
    EMBED_MODEL: str = "nomic-embed-text"
    GEN_MODEL: str = "llama3.2:3b"

    # Persona
    SYSTEM_PROMPT: str = (
        "You are Bumblebee, a friendly and intelligent AI assistant. "
        "Answer the user's question directly and helpfully. "
        "Use the provided context if it is relevant. "
        "Do NOT say things like 'based on the context provided' — just answer naturally."
    )

settings = Settings()
