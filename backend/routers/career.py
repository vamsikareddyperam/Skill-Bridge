from fastapi import APIRouter
from data.careers import CAREERS

router = APIRouter(
    prefix="/api/career",
    tags=["Career"]
)


@router.get("/test")
def career_test():
    return {
        "message": "Career recommendation API is working!"
    }


@router.get("/list")
def get_careers():
    return {
        "careers": CAREERS
    }