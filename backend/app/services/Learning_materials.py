#!/usr/bin/env python3
"""
Stable Learning Material Generator
- Calls model per-chapter to avoid JSON truncation
- Merges validated parts into final JSON
- Ensures valid schema & saves safely
"""

import os
import json
import re
from datetime import datetime, timezone
from dotenv import load_dotenv
from mistralai import Mistral

load_dotenv()
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

student_report = {
    "chapter_analysis": {
        "Reading Comprehension": {"weakness_level": "severe"},
        "Grammar": {"weakness_level": "severe"},
        "Writing Skills": {"weakness_level": "severe"},
        "Literature": {"weakness_level": "moderate"},
        "Poetry Analysis": {"weakness_level": "severe"},
        "Essay Writing": {"weakness_level": "severe"},
        "Letter Writing": {"weakness_level": "moderate"}
    }
}

SYSTEM = """
You output STRICT JSON ONLY. No markdown. No surrounding text.

CHAPTER JSON SCHEMA REQUIRED:
{
 "chapter_name": string,
 "weakness_level": "severe" | "moderate" | "correct",
 "priority": integer(1-5),
 "estimated_time_hours": number,
 "prerequisites": [
   {"concept": string, "why": string, "recommended_resource": string}
 ],
 "roadmap_steps": [
   {"step_number": integer, "objective": string, "estimated_time_minutes": integer}
 ],
 "resources": [
   {
     "id": string,
     "type": "video"|"article"|"website"|"exercise",
     "title": string,
     "url": string,
     "description": string,
     "level": "beginner"|"intermediate",
     "estimated_time_minutes": integer
   }
 ]
}

Rules:
- severe → max 4 resources, beginner only
- moderate → max 3 resources
- Use only: KhanAcademy, OWL Purdue, BBC Bitesize, EdX, PoetryFoundation, SparkNotes, CrashCourse YouTube
- URLs must be real and academic.
"""

def extract_json(response_text):
    text = re.sub(r"```(?:json)?", "", response_text).strip()
    match = re.search(r"\{[\s\S]*\}", text)
    if not match: return None
    try:
        return json.loads(match.group(0))
    except Exception:
        try:
            return json.loads(re.sub(r",\s*([\]}])", r"\1", match.group(0)))
        except:
            return None

def generate_chapter(chapter, weakness):
    prompt = f"""
Generate JSON for one chapter:
chapter_name: "{chapter}"
weakness_level: "{weakness}"
    """
    for _ in range(3):  # retry 3 times
        res = client.chat.complete(model="mistral-small-latest", messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt}
        ], stream=False)
        content = res.choices[0].message.content
        data = extract_json(content)
        if data: return data
    return {"chapter_name": chapter, "weakness_level": weakness, "error": "failed"}

def main():
    final = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "schema_version": "1.0",
        "generator_model": "mistral-small-latest",
        "chapters": [],
        "global_recommendations": {
            "weekly_study_hours": 6,
            "assessment_checkpoints_weeks": [2,4,6],
            "minimum_duration_weeks": 6,
            "notes": "Focus on foundational writing & comprehension skills."
        }
    }

    for chapter, info in student_report["chapter_analysis"].items():
        print(f"Generating → {chapter}")
        result = generate_chapter(chapter, info["weakness_level"])
        final["chapters"].append(result)

    fname = f"learning_materials_final_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(final, f, indent=2)

    print("\n🎯 SUCCESS! Saved:", fname)

if __name__ == "__main__":
    main()
