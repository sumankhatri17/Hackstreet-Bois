# Assessment Evaluation System - How It Works

## JSON File Structure

When a student submits an assessment, a JSON file is created with the following structure:

```json
{
  "assessment_id": "015329e4-bf22-43a2-9cb5-cc15351b5b85",
  "user_id": 1,
  "user_name": "Hridayanshu Acharya",
  "user_email": "hridayanshu23@gmail.com",
  "chapter": "All Chapters",
  "subject": "maths",
  "answers": [
    {
      "question_id": "dced07d7-3aca-4e29-a4a3-2f7c9317f128",
      "answer": "student's answer here",
      "chapter": "Real Numbers",
      "question": "Prove that √5 is an irrational number..."
    }
  ],
  "submitted_at": "2025-12-25T10:30:00.000000",
  "status": "pending_evaluation"
}
```

**File Location:** `backend/assessments/{user_id}/{assessment_id}.json`

## How Each Response is Distinguished

### 1. **Assessment Level** (Unique per submission)

- **`assessment_id`**: UUID generated when assessment is submitted
- **`user_id`**: Which student submitted it
- **Location**: Each file is in `assessments/{user_id}/` directory

### 2. **Question Level** (Unique per question)

- **`question_id`**: UUID generated when questions are created
- **`chapter`**: Which chapter the question belongs to
- **`question`**: The actual question text

### 3. **Answer Level** (Student's response)

- **`answer`**: Student's written response to the question

## Evaluation Flow

### Step 1: Student Submits Assessment

```
POST /rag/submit-assessment
↓
Creates: assessments/1/015329e4-bf22-43a2-9cb5-cc15351b5b85.json
```

### Step 2: Evaluation Triggered

```
POST /rag/evaluate-assessment/015329e4-bf22-43a2-9cb5-cc15351b5b85
↓
Reads: assessments/1/015329e4-bf22-43a2-9cb5-cc15351b5b85.json
↓
Sends to Mistral AI (evaluation_service.py)
↓
Receives evaluation results
↓
Creates: assessments/1/015329e4-bf22-43a2-9cb5-cc15351b5b85_evaluation.json
```

### Step 3: Database Updated

```
Updates User table:
- math_level = 82 (from evaluation score)
- fit_to_teach_level = 6 (calculated based on score)
```

## How Evaluator.py Distinguishes Responses

The `evaluation_service.py` (integrated version of your `Evaluator.py`) works as follows:

### Input to AI:

```json
{
  "subject": "maths",
  "answers": [
    {
      "question_id": "uuid-1",
      "answer": "student answer 1",
      "chapter": "Real Numbers",
      "question": "question text 1"
    },
    {
      "question_id": "uuid-2",
      "answer": "student answer 2",
      "chapter": "Polynomials",
      "question": "question text 2"
    }
  ]
}
```

### AI Returns:

```json
{
  "chapter_analysis": {
    "Real Numbers": { "correct": 5, "incorrect": 0, ... },
    "Polynomials": { "correct": 4, "incorrect": 1, ... }
  },
  "question_analysis": {
    "uuid-1": { "correctness": "correct", "score": 1 },
    "uuid-2": { "correctness": "incorrect", "score": 0, "medium_reason": "..." }
  },
  "overall_analysis": {
    "final_score_out_of_100": 82,
    "estimated_student_grade_level": 9,
    ...
  }
}
```

## Key Points

1. **Each assessment submission = 1 JSON file**

   - Unique `assessment_id` (UUID)
   - Stored in user-specific directory

2. **Each question within assessment = unique `question_id`**

   - AI uses `question_id` as key in `question_analysis`
   - Chapter information groups questions

3. **Evaluation results = separate JSON file**

   - Same filename with `_evaluation` suffix
   - Example: `{assessment_id}_evaluation.json`

4. **No confusion between responses because:**
   - Different assessments have different UUIDs
   - Questions within assessment have unique UUIDs
   - Each user has separate directory
   - Evaluation references question_ids from assessment

## Example File System Structure

```
backend/assessments/
├── 1/  (user_id = 1)
│   ├── 015329e4-bf22-43a2-9cb5-cc15351b5b85.json  (assessment)
│   ├── 015329e4-bf22-43a2-9cb5-cc15351b5b85_evaluation.json  (results)
│   ├── 4b23b0c0-59b3-4579-b65d-cda3a4b4b477.json
│   └── 4b23b0c0-59b3-4579-b65d-cda3a4b4b477_evaluation.json
├── 2/  (user_id = 2)
│   └── ...
```

## Why This Design Works

✅ **Scalable**: Each user has own directory  
✅ **Self-contained**: Assessment JSON has all needed info  
✅ **Traceable**: UUID system prevents collisions  
✅ **Auditable**: Original submission + evaluation both preserved  
✅ **Fast lookup**: Direct file access by assessment_id  
✅ **No database bloat**: Large text answers in files, not DB

## Integration with Your Original Evaluator.py

Your `Evaluator.py` had:

```python
with open("./MathAssesment.json", "r") as f:
    assessment_data = json.load(f)
```

Our integrated version (`evaluation_service.py`) does:

```python
def evaluate_assessment(self, assessment_file_path: Path):
    with open(assessment_file_path, "r", encoding="utf-8") as f:
        assessment_data = json.load(f)
    # ... same AI logic as your Evaluator.py
```

**Key difference:** Instead of hardcoded filename, it accepts any assessment file path dynamically!
