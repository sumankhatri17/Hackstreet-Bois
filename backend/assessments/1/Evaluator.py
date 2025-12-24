from mistralai import Mistral
import os
import json
import re
from dotenv import load_dotenv
load_dotenv()
# Load student assessment JSON (the dataset you created earlier)
with open("./MathAssesment.json", "r") as f:
    assessment_data = json.load(f)

STRICT_PROMPT = """
You are a strict, deterministic Mathematics Assessment Evaluation Engine for Grade 10.

You behave like an automated grading system, not a tutor or assistant.


INPUT

You will receive a JSON object representing a student's Grade-10 mathematics assessment.
Each item contains:
- chapter
- question
- student_answer

EVALUATION RULES (NON-NEGOTIABLE)

- Evaluate strictly according to NCERT / Grade-10 curriculum expectations.
- Do NOT be lenient.
- Do NOT infer intent beyond the written answer.
- Incorrect formula, incorrect logic, missing steps, or irrelevant text = incorrect.
- Correct method with minor arithmetic mistake = partial.
- Guessing, nonsense, placeholders, or off-topic text = incorrect.
- If an answer does not address the question directly, mark it incorrect.
- Treat each question independently.


PER-QUESTION OUTPUT

For EVERY question, output:
- correctness: one of ["correct", "partial", "incorrect"]
- score: one of [1, 0.5, 0]
- medium_reason:
  - Include ONLY if correctness is "incorrect" or "partial"
  - 10–20 words
  - Focus on the exact conceptual or procedural mistake
  - Do NOT explain the correct solution


PER-CHAPTER ANALYSIS

For EACH chapter, compute:
- total_questions
- correct
- partial
- incorrect
- accuracy_percentage (rounded to nearest integer)
- chapter_score_out_of_10 (based on scores)
- weakness_level:
    - "none" (≥85%)
    - "mild" (70–84%)
    - "moderate" (50–69%)
    - "severe" (<50%)


OVERALL ANALYSIS (FOCUS ON WEAKNESSES)

Compute:
- final_score_out_of_100
- estimated_student_grade_level:
    - 10 if ≥85%
    - 9 if 70–84%
    - 8 if 55–69%
    - 7 if 40–54%
    - 6 if <40%
- strongest_chapters (top 2 by accuracy)
- weakest_chapters (bottom 3 by accuracy)

learning_gap_summary:
- 3–5 short paragraphs (each 1–2 lines)
- Focus primarily on WEAK and SEVERE chapters
- Identify:
    - missing foundational concepts
    - patterns of errors (formula misuse, conceptual gaps, algebraic weakness, etc.)
    - grade-level mismatch indicators
- Avoid generic advice
- Do NOT repeat statistics
- Be diagnostic, not motivational


OUTPUT FORMAT (CRITICAL)

- Return ONLY valid JSON
- Output must start with '{' and end with '}'
- Do NOT include markdown
- Do NOT include comments
- Do NOT include explanations outside JSON
- Do NOT include any extra text
- If evaluation is impossible, return an empty JSON object {}

"""
def convert_raw_model_output_to_json(raw_text: str) -> dict:
    """
    Converts raw LLM output (with markdown/code fences) into valid JSON.
    Raises ValueError if JSON is invalid.
    """

   
    cleaned_text = re.sub(r"```json|```", "", raw_text).strip()

 
    match = re.search(r"\{[\s\S]*\}", cleaned_text)
    if not match:
        raise ValueError("No JSON object found in model output")

    json_text = match.group(0)

    try:
        parsed_json = json.loads(json_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format: {e}")

    return parsed_json


with Mistral(api_key=os.getenv("MISTRAL_API_KEY", "")) as mistral:

    response = mistral.chat.complete(
        model="mistral-small-latest",
        messages=[
            {
                "role": "system",
                "content": STRICT_PROMPT
            },
            {
                "role": "user",
                "content": json.dumps(assessment_data)
            }
        ],
        temperature=0.1,
        top_p = 0.9,   
        stream=False
    )

  
    raw_output = response.choices[0].message.content
    clean_json = convert_raw_model_output_to_json(raw_output)

    
    print(json.dumps(clean_json, indent=2))

   
    with open("Assessment_Evaluation.json", "w", encoding="utf-8") as f:
        json.dump(clean_json, f, indent=2)

    print(" JSON successfully converted and saved!")






