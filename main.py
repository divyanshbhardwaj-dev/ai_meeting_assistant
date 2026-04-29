import uvicorn
from fastapi import FastAPI
from app.api.routes import router
from app.api.transcription_router import router as transcription_router
from app.utils.logger import setup_logger
from fastapi.middleware.cors import CORSMiddleware

logger = setup_logger(__name__)

app = FastAPI(title="Agentic Meeting Assistant")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev (frontend localhost)
    allow_credentials=True,
    allow_methods=["*"],  # IMPORTANT → allows OPTIONS
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(transcription_router)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Agentic Meeting Assistant...")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
