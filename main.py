import uvicorn
from fastapi import FastAPI
from app.api.routes import router
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

app = FastAPI(title="Agentic Meeting Assistant")

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Agentic Meeting Assistant...")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
