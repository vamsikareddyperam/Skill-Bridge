from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.career import router as career_router

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.5.85:3000",
    "https://skill-bridge-elgckvwji-vamsikareddyperam-7319s-projects.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(career_router)


@app.get("/")
def read_root():
    return {"message": "SkillBridge backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}