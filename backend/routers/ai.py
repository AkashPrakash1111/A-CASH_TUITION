import os

from fastapi import APIRouter, Depends, HTTPException

from models.user import UserRole
from schemas.ai import AIGenerateRequest, AIGenerateResponse
from utils.deps import require_role

router = APIRouter(prefix="/ai", tags=["ai"])


def _build_prompt(tool: str, inputs: dict) -> tuple[str, str]:
    """Returns (system_prompt, user_prompt) for a given AI Studio tool.

    Kept server-side (rather than letting the frontend send a raw prompt)
    so the actual instructions given to the model are controlled and
    auditable in one place, and so the frontend only ever sends structured
    form fields.
    """

    class_name = inputs.get("className", "")
    subject = inputs.get("subject", "")
    topic = inputs.get("topic", "")

    if tool == "question-paper":
        exam_type = inputs.get("examType", "Unit Test")
        total_marks = inputs.get("totalMarks", "50")
        difficulty = inputs.get("difficulty", "Moderate")

        system = (
            "You are an experienced school exam-paper setter. Produce a "
            "clean, well-structured exam paper in plain text/markdown, "
            "organized into sections by marks-per-question (e.g. Section A: "
            "1-mark questions, Section B: 5-mark questions), with an answer "
            "key omitted. Number every question. Do not add commentary "
            "before or after the paper."
        )

        user = (
            f"Create a {exam_type} question paper for Class {class_name}, "
            f"Subject: {subject}. Topics to cover: {topic}. "
            f"Total marks: {total_marks}. Overall difficulty: {difficulty}."
        )

    elif tool == "notes":
        length = inputs.get("length", "Detailed")

        system = (
            "You are a subject-matter teacher writing revision notes for "
            "students. Use clear headings, short paragraphs and bullet "
            "points. Avoid filler and avoid restating the request back to "
            "the reader."
        )

        user = (
            f"Write {length.lower()} revision notes for Class {class_name}, "
            f"Subject: {subject}, Topic: {topic}."
        )

    elif tool == "lesson-plan":
        duration = inputs.get("duration", "45")

        system = (
            "You are a curriculum planner. Produce a lesson plan with clear "
            "sections: Learning Objectives, Materials Needed, a "
            "minute-by-minute Activity Breakdown that fits the given "
            "duration, and an Assessment / Wrap-up. Use headings and "
            "bullet points."
        )

        user = (
            f"Build a {duration}-minute lesson plan for Class {class_name}, "
            f"Subject: {subject}, Topic: {topic}."
        )

    elif tool == "doubt-solver":
        question = inputs.get("question", "")

        system = (
            "You are a patient, encouraging tutor explaining a concept to a "
            "school student. Explain step by step in simple language, use "
            "a short worked example where relevant, and keep it focused — "
            "no unnecessary preamble."
        )

        user = (
            f"A Class {class_name} student studying {subject} asked: "
            f"\"{question}\". Explain the answer clearly."
        )

    else:
        raise HTTPException(status_code=400, detail=f"Unknown AI tool: {tool}")

    return system, user


@router.post("/generate", response_model=AIGenerateResponse)
def generate(
    payload: AIGenerateRequest,
    _admin=Depends(require_role(UserRole.admin)),
):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI Studio isn't configured yet. Add ANTHROPIC_API_KEY to "
                "backend/.env and restart the server."
            ),
        )

    try:
        import anthropic
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "The 'anthropic' package isn't installed. Run "
                "'pip install -r requirements.txt' in backend/."
            ),
        ) from exc

    system_prompt, user_prompt = _build_prompt(payload.tool, payload.inputs)
    model = os.getenv("AI_MODEL", "claude-sonnet-5")

    client = anthropic.Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model=model,
            max_tokens=2000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception as exc:  # noqa: BLE001 — surface any provider error to the caller
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc

    content = "".join(
        block.text for block in response.content if getattr(block, "type", None) == "text"
    )

    return {"content": content}
