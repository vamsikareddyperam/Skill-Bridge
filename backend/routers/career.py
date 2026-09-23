from fastapi import APIRouter
from pydantic import BaseModel

from data.careers import CAREERS


router = APIRouter(
    prefix="/api/career",
    tags=["Career"]
)


class StudentProfile(BaseModel):
    skills: list[str]
    soft_skills: list[str] = []
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
        skill.lower().strip()
        for skill in profile.skills
    }

    recommendations = []

    for career in CAREERS:

        required_skills = {
            skill.lower()
            for skill in career["technical_skills"]
        }

        matching_skills = student_skills.intersection(
            required_skills
        )

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


@router.post("/skill-gap")
def skill_gap(profile: StudentProfile, career_id: str):

    student_skills = {
        skill.lower().strip()
        for skill in profile.skills
    }

    selected_career = None

    for career in CAREERS:
        if career["id"] == career_id:
            selected_career = career
            break

    if selected_career is None:
        return {
            "error": "Career not found"
        }

    required_technical_skills = {
        skill.lower()
        for skill in selected_career["technical_skills"]
    }

    required_soft_skills = {
        skill.lower()
        for skill in selected_career["soft_skills"]
    }

    technical_have = sorted(
        student_skills.intersection(
            required_technical_skills
        )
    )

    technical_missing = sorted(
        required_technical_skills - student_skills
    )

    soft_have = sorted(
        student_skills.intersection(
            required_soft_skills
        )
    )

    soft_missing = sorted(
        required_soft_skills - student_skills
    )

    return {
        "career": selected_career["title"],
        "technical_skills": {
            "have": technical_have,
            "missing": technical_missing
        },
        "soft_skills": {
            "have": soft_have,
            "missing": soft_missing
        }
    }

@router.post("/roadmap")
def generate_roadmap(profile: StudentProfile, career_id: str):

    student_skills = {
        skill.lower().strip()
        for skill in profile.skills
    }

    student_soft_skills = {
        skill.lower().strip()
        for skill in profile.soft_skills
    }

    selected_career = None

    for career in CAREERS:
        if career["id"] == career_id:
            selected_career = career
            break

    if selected_career is None:
        return {
            "error": "Career not found"
        }

    required_technical_skills = [
        skill.lower()
        for skill in selected_career["technical_skills"]
    ]

    required_soft_skills = [
        skill.lower()
        for skill in selected_career["soft_skills"]
    ]

    missing_technical_skills = [
        skill
        for skill in required_technical_skills
        if skill not in student_skills
    ]

    missing_soft_skills = [
        skill
        for skill in required_soft_skills
        if skill not in student_soft_skills
    ]

    roadmap = []

    roadmap_details = {
        "machine learning": {
            "estimated_time": "2 weeks",
            "difficulty": "Intermediate",
            "milestone": "Build a basic machine learning model",
        },
        "data structures": {
            "estimated_time": "2 weeks",
            "difficulty": "Beginner",
            "milestone": "Solve beginner problems using common data structures",
        },
        "problem solving": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Solve 5 beginner programming problems",
        },
        "communication": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Give a short explanation of a technical topic",
        },
        "teamwork": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Complete a small project task with a partner",
        },
    }

    learning_resources = selected_career.get(
        "learning_resources",
        {}
    )

    all_missing_skills = (
        missing_technical_skills
        + missing_soft_skills
    )

    for index, skill in enumerate(
        all_missing_skills,
        start=1
    ):

        resources = learning_resources.get(
            skill,
            [
                f"Practice exercises related to {skill}",
                f"Build a small project or activity using {skill}"
            ]
        )

        details = roadmap_details.get(
            skill,
            {
                "estimated_time": "2 weeks",
                "difficulty": "Beginner",
                "milestone": f"Complete a practical activity using {skill}",
            }
        )

        roadmap.append({
            "step": index,
            "skill": skill,
            "goal": f"Learn and improve {skill}",
            "practice": f"Complete exercises and practical activities related to {skill}",
            "resources": resources,
            "estimated_time": details["estimated_time"],
            "difficulty": details["difficulty"],
            "milestone": details["milestone"]
        })

    return {
        "career": selected_career["title"],
        "roadmap": roadmap
    }
