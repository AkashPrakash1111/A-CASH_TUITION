import os
from fastapi import APIRouter, Depends, HTTPException

from models.user import User, UserRole
from schemas.ai import AIGenerateRequest, AIGenerateResponse
from utils.deps import get_current_user

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

    elif tool == "concept-explainer":
        system = (
            "You are an engaging, whimsical science/arts teacher. Explain the requested "
            "concept using a vivid real-world analogy, simple bullet points, and a "
            "fun 'Did You Know?' fact suitable for children and teenagers."
        )
        user = f"Explain the concept of '{topic}' in {subject} for Class {class_name} students."

    elif tool == "practice-questions":
        count = inputs.get("count", "5")
        system = (
            "You are an expert tutor preparing practice exercises. Provide "
            "practice questions ranging from fundamental to challenging, with short hints."
        )
        user = f"Generate {count} practice questions for Class {class_name} {subject} on topic '{topic}'."

    elif tool == "study-planner":
        days = inputs.get("days", "7")
        system = (
            "You are a structured academic mentor. Create a realistic daily study routine "
            "breaking down topics into manageable 30-minute revision blocks."
        )
        user = f"Create a {days}-day revision timetable for {subject} covering: {topic}."

    elif tool == "batch-insights":
        system = (
            "You are an academic operations director analyzing institutional performance. "
            "Provide concise diagnostic summaries and actionable pedagogical recommendations."
        )
        user = f"Provide performance insights and teaching advice for Class {class_name} {subject} batch."

    else:
        raise HTTPException(status_code=400, detail=f"Unknown AI tool: {tool}")

    return system, user


@router.post("/generate", response_model=AIGenerateResponse)
def generate(
    payload: AIGenerateRequest,
    _user: User = Depends(get_current_user),
):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI Studio is waiting for an API key. Add ANTHROPIC_API_KEY to "
                "backend/.env and restart the server. In the meantime, you can explore "
                "the built-in syllabus templates."
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
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc

    content = "".join(
        block.text for block in response.content if getattr(block, "type", None) == "text"
    )

    return {"content": content}


@router.get("/status")
def get_ai_status():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    configured = bool(api_key and len(api_key.strip()) > 5)
    return {
        "configured": configured,
        "provider": "Anthropic Claude" if configured else "Deterministic Curriculum Templates",
        "model": os.getenv("AI_MODEL", "claude-sonnet-5"),
    }


CURRICULUM_TEMPLATES = {
    "Mathematics": {
        "Unit Test Paper": "### Mathematics Class 10 — Periodic Assessment\n**Total Marks:** 50 | **Duration:** 90 Mins\n\n#### Section A (1 Mark each)\n1. If HCF(a, b) = 12 and a * b = 1800, find LCM(a, b).\n2. Write the quadratic polynomial whose zeroes are 3 and -5.\n3. Find the 10th term of the AP: 2, 7, 12...\n\n#### Section B (3 Marks each)\n4. Prove that √5 is an irrational number.\n5. Solve using substitution method:\n   2x + 3y = 11\n   2x - 4y = -24\n\n#### Section C (5 Marks each)\n6. State and prove Basic Proportionality Theorem (Thales Theorem).",
        "Revision Notes": "### Rapid Revision: Quadratic Equations\n- **Standard Form:** ax² + bx + c = 0 (a ≠ 0)\n- **Discriminant (D):** D = b² - 4ac\n  - D > 0: Two distinct real roots\n  - D = 0: Two equal real roots\n  - D < 0: No real roots\n- **Quadratic Formula:** x = (-b ± √D) / 2a",
        "Lesson Plan": "### 45-Minute Lesson Plan: Surface Areas and Volumes\n- **0-5 min:** Recall formulas of cylinder, cone, sphere.\n- **5-20 min:** Demonstration of composite solid problems (cone mounted on hemisphere).\n- **20-35 min:** Guided group problem solving on board.\n- **35-45 min:** Exit ticket test on volume conservation during melting/recasting.",
    },
    "Physics": {
        "Unit Test Paper": "### Physics Assessment: Light — Reflection and Refraction\n**Total Marks:** 40 | **Time:** 60 Mins\n\n#### Short Questions (2 Marks)\n1. Define refractive index. Why does diamond have a high refractive index?\n2. Draw a ray diagram for an object placed between F and C of a concave mirror.\n\n#### Numerical Problems (4 Marks)\n3. A concave lens has focal length of 15 cm. At what distance should the object from the lens be placed so that it forms an image at 10 cm from the lens?",
        "Revision Notes": "### Quick Reference: Electric Circuits & Ohm's Law\n- **Ohm's Law:** V = I * R at constant temperature.\n- **Resistors in Series:** R_s = R1 + R2 + R3 (Current remains identical across all).\n- **Resistors in Parallel:** 1/R_p = 1/R1 + 1/R2 + 1/R3 (Voltage remains identical across branches).\n- **Joule's Law of Heating:** H = I² * R * t.",
        "Lesson Plan": "### Interactive Lab Lesson: Magnetic Effects of Electric Current\n- **Objective:** Map magnetic field lines around a straight current carrying conductor.\n- **Apparatus:** Cardboard, copper wire, battery, iron filings, compass.\n- **Activity:** Observe concentric magnetic circles and verify Right Hand Thumb Rule.",
    },
    "Chemistry": {
        "Unit Test Paper": "### Chemistry Unit Test: Chemical Reactions & Equations\n**Total Marks:** 35 | **Time:** 60 Mins\n\n1. What is a redox reaction? Identify oxidizing and reducing agents in:\n   CuO + H2 -> Cu + H2O\n2. Why does the color of copper sulphate solution change when an iron nail is dipped in it?\n3. Balance the chemical equation: Fe + H2O -> Fe3O4 + H2",
        "Revision Notes": "### Acids, Bases & Salts Cheat Sheet\n- **pH Scale:** 0 to 14 (<7 Acidic, 7 Neutral, >7 Alkaline)\n- **Bleaching Powder:** CaOCl2 (Produced by action of chlorine on dry slaked lime)\n- **Baking Soda:** NaHCO3 (Sodium hydrogen carbonate)\n- **Plaster of Paris:** CaSO4 · 1/2 H2O (Gypsum heated at 373 K)",
        "Lesson Plan": "### Lesson Plan: Metals and Non-Metals Reactivity Series\n- **Hook:** Dropping sodium in water vs copper in water (demonstration video).\n- **Core:** Displacement reactions and placement on reactivity scale.\n- **Wrap-up:** Student challenge table.",
    },
    "Biology": {
        "Unit Test Paper": "### Life Processes Class 10 Biology Test\n**Total Marks:** 35 | **Time:** 50 Mins\n\n1. What are the essential conditions needed for autotrophic nutrition?\n2. Describe double circulation in human heart with schematic flow chart.\n3. Explain the structure and functioning of nephrons in human kidneys.",
        "Revision Notes": "### Key Cellular Notes: Respiration\n- **Aerobic Respiration:** Occurs in Mitochondria in presence of O2 -> 38 ATP + CO2 + H2O.\n- **Anaerobic (Yeast):** Fermentation -> Ethanol + CO2 + 2 ATP.\n- **Anaerobic (Muscle Cells):** Lactic acid buildup causing cramps.",
        "Lesson Plan": "### Lesson Plan: Human Digestive System\n- Trace alimentary canal pathway: Mouth -> Esophagus -> Stomach -> Small Intestine -> Large Intestine.\n- Role of enzymes: Salivary Amylase, Pepsin, Trypsin, Lipase.",
    },
}


@router.get("/templates")
def get_curriculum_templates():
    return CURRICULUM_TEMPLATES

