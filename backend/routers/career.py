from fastapi import APIRouter
from pydantic import BaseModel

from data.careers import CAREERS

router = APIRouter(
    prefix="/api/career",
    tags=["Career"]
)


class StudentProfile(BaseModel):
    skills: list[str]
    interests: list[str] = []


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


@router.post("/recommend")
def recommend_careers(profile: StudentProfile):
    student_skills = {
        skill.lower()
        for skill in profile.skills
    }

    recommendations = []

    for career in CAREERS:
        required_skills = {
            skill.lower()
            for skill in career["technical_skills"]
        }

        matching_skills = student_skills.intersection(required_skills)

        score = len(matching_skills)

        interest_matches = [
            interest
            for interest in profile.interests
            if interest.lower() in career["title"].lower()
            or interest.lower() in career["description"].lower()
        ]

        score += len(interest_matches)

        recommendations.append({
            "career": career["title"],
            "score": score,
            "matching_skills": list(matching_skills),
            "matching_interests": interest_matches
        })

    recommendations.sort(
        key=lambda career: career["score"],
        reverse=True
    )

    return {
        "recommendations": recommendations
    }