from fastapi import APIRouter
from pydantic import BaseModel

from data.careers import CAREERS
from services.gemini_service import generate_ai_response


router = APIRouter(
    prefix="/api/career",
    tags=["Career"]
)


# -----------------------------
# Student profile model
# -----------------------------

class StudentProfile(BaseModel):
    skills: list[str]
    soft_skills: list[str] = []
    interest: str = ""


# -----------------------------
# Test endpoint
# -----------------------------

@router.get("/test")
def career_test():
    return {
        "message": "Career API is working!"
    }


# -----------------------------
# List all careers
# -----------------------------

@router.get("/list")
def list_careers():
    return {
        "careers": CAREERS
    }


# -----------------------------
# Career recommendations
# -----------------------------

@router.post("/recommend")
def recommend_careers(profile: StudentProfile):

    student_skills = {
        skill.lower().strip()
        for skill in profile.skills
    }

    student_interest = profile.interest.lower().strip()

    recommendations = []

    for career in CAREERS:

        score = 0

        # Match technical skills
        for skill in career["technical_skills"]:

            if skill.lower().strip() in student_skills:
                score += 1

        # Match interest with career title/description
        career_text = (
            career["title"] + " " +
            career["description"]
        ).lower()

        if student_interest and student_interest in career_text:
            score += 1

        recommendations.append({
            "career_id": career["id"],
            "title": career["title"],
            "description": career["description"],
            "score": score
        })

    recommendations.sort(
        key=lambda career: career["score"],
        reverse=True
    )

    return {
        "recommendations": recommendations
    }


# -----------------------------
# Skill gap analysis
# -----------------------------

@router.post("/skill-gap")
def skill_gap(
    profile: StudentProfile,
    career_id: str
):

    selected_career = None

    for career in CAREERS:

        if career["id"] == career_id:
            selected_career = career
            break

    if selected_career is None:
        return {
            "error": "Career not found"
        }

    student_skills = {
        skill.lower().strip()
        for skill in profile.skills
    }

    student_soft_skills = {
        skill.lower().strip()
        for skill in profile.soft_skills
    }

    required_technical_skills = [
        skill.lower().strip()
        for skill in selected_career["technical_skills"]
    ]

    required_soft_skills = [
        skill.lower().strip()
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

    existing_technical_skills = [
        skill
        for skill in selected_career["technical_skills"]
        if skill.lower().strip() in student_skills
    ]

    existing_soft_skills = [
        skill
        for skill in selected_career["soft_skills"]
        if skill.lower().strip() in student_soft_skills
    ]

    return {
        "career": selected_career["title"],
        "existing_technical_skills": existing_technical_skills,
        "existing_soft_skills": existing_soft_skills,
        "missing_technical_skills": missing_technical_skills,
        "missing_soft_skills": missing_soft_skills
    }


# -----------------------------
# Personalized roadmap
# -----------------------------

@router.post("/roadmap")
def generate_roadmap(
    profile: StudentProfile,
    career_id: str
):

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
        skill.lower().strip()
        for skill in selected_career["technical_skills"]
    ]

    required_soft_skills = [
        skill.lower().strip()
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
            "milestone": "Build a basic machine learning model"
        },

        "data structures": {
            "estimated_time": "2 weeks",
            "difficulty": "Beginner",
            "milestone": "Solve beginner problems using common data structures"
        },

        "problem solving": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Solve 5 beginner programming problems"
        },

        "communication": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Give a short explanation of a technical topic"
        },

        "teamwork": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Complete a small project task with a partner"
        },

        "python": {
            "estimated_time": "2 weeks",
            "difficulty": "Beginner",
            "milestone": "Build a small Python project"
        },

        "sql": {
            "estimated_time": "2 weeks",
            "difficulty": "Beginner",
            "milestone": "Write SQL queries using a sample database"
        },

        "databases": {
            "estimated_time": "2 weeks",
            "difficulty": "Beginner",
            "milestone": "Build a small relational database"
        },

        "html": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Build a semantic HTML webpage"
        },

        "css": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Build a responsive webpage"
        },

        "javascript": {
            "estimated_time": "2 weeks",
            "difficulty": "Beginner",
            "milestone": "Build an interactive web application"
        },

        "react": {
            "estimated_time": "2 weeks",
            "difficulty": "Intermediate",
            "milestone": "Build a React project using components and state"
        },

        "creativity": {
            "estimated_time": "1 week",
            "difficulty": "Beginner",
            "milestone": "Create a small original interface or project idea"
        }
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
                "milestone": (
                    f"Complete a practical activity using {skill}"
                )
            }
        )

        roadmap.append({
            "step": index,
            "skill": skill,
            "goal": f"Learn and improve {skill}",
            "practice": (
                f"Complete exercises and practical activities "
                f"related to {skill}"
            ),
            "resources": resources,
            "estimated_time": details["estimated_time"],
            "difficulty": details["difficulty"],
            "milestone": details["milestone"]
        })

    return {
        "career": selected_career["title"],
        "roadmap": roadmap
    }


# -----------------------------
# Gemini AI career explanation
# -----------------------------

@router.post("/ai-explanation")
def ai_career_explanation(
    profile: StudentProfile,
    career_id: str
):

    selected_career = None

    for career in CAREERS:

        if career["id"] == career_id:
            selected_career = career
            break

    if selected_career is None:
        return {
            "error": "Career not found"
        }

    prompt = f"""
You are a career guidance assistant for a student.

Student technical skills:
{profile.skills}

Student soft skills:
{profile.soft_skills}

Student interest:
{profile.interest}

Recommended career:
{selected_career["title"]}

Career description:
{selected_career["description"]}

Explain in simple language:

1. Why this career matches the student's interests and skills.
2. What skills the student already has that are useful.
3. What important skills the student should develop next.

Keep the answer encouraging, practical, and concise.
"""

    # Try Gemini first
    explanation = generate_ai_response(prompt)

    # -------------------------------------------------
    # Fallback guidance if Gemini is temporarily down
    # -------------------------------------------------

    if not explanation:

        technical_skills = selected_career["technical_skills"]
        soft_skills = selected_career["soft_skills"]

        student_skills = {
            skill.lower().strip()
            for skill in profile.skills
        }

        student_soft_skills = {
            skill.lower().strip()
            for skill in profile.soft_skills
        }

        existing_technical = [
            skill
            for skill in technical_skills
            if skill.lower().strip() in student_skills
        ]

        missing_technical = [
            skill
            for skill in technical_skills
            if skill.lower().strip() not in student_skills
        ]

        existing_soft = [
            skill
            for skill in soft_skills
            if skill.lower().strip() in student_soft_skills
        ]

        missing_soft = [
            skill
            for skill in soft_skills
            if skill.lower().strip() not in student_soft_skills
        ]

        existing_skills_text = (
            ", ".join(
                existing_technical + existing_soft
            )
            if existing_technical or existing_soft
            else "You are starting with a clean learning path."
        )

        missing_technical_text = (
            ", ".join(missing_technical)
            if missing_technical
            else "You already have the main technical skills required for this career."
        )

        missing_soft_text = (
            ", ".join(missing_soft)
            if missing_soft
            else "You already have the main soft skills required for this career."
        )

        explanation = f"""
Your target career is {selected_career["title"]}.

Why it matches you:

Your current interests and skills provide a useful starting point
for this career. The skills you already have can help you begin
learning the requirements of this role.

Skills you already have:

{existing_skills_text}

Technical skills to develop:

{missing_technical_text}

Soft skills to develop:

{missing_soft_text}

Recommended approach:

Start with the first skill in your roadmap, practice it through
a small project, and gradually build the remaining skills.

Focus on practical projects so that you can demonstrate your
progress through a portfolio.

Your SkillBridge roadmap is designed to help you move from your
current skill level toward your target career step by step.
"""

    return {
        "career": selected_career["title"],
        "explanation": explanation.strip()
    }