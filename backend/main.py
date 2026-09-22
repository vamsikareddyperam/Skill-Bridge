from fastapi import FastAPI
from routers.career import router as career_router

app = FastAPI()

app.include_router(career_router)


@app.get("/")
def read_root():
    return {"message": "SkillBridge backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}