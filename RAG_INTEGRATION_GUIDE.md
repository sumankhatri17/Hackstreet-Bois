# RAG-Based Assessment System Integration Guide

## Overview

This document explains how the Python RAG (Retrieval-Augmented Generation) system has been integrated with your EduAssess application to enable AI-powered question generation and assessment submission.

## Architecture

### 1. **RAG Service (`backend/app/services/rag_service.py`)**

The core service that handles:

- Loading data from JSONL/JSON files
- Text chunking and embedding generation using Mistral AI
- FAISS vector index creation for semantic search
- Question generation from structured data (mathsclass9.json, mathsclass10.json, etc.)
- Context retrieval for answering questions

### 2. **API Routes (`backend/app/api/routes/rag_questions.py`)**

RESTful endpoints:

- `POST /api/v1/rag/generate-questions` - Generate questions for a chapter
- `GET /api/v1/rag/available-chapters` - Get list of available chapters by subject
- `POST /api/v1/rag/submit-assessment` - Submit student answers
- `GET /api/v1/rag/user-assessments` - Get all assessments for current user
- `GET /api/v1/rag/assessment/{id}` - Get specific assessment details

### 3. **Frontend Service (`frontend/src/services/ragQuestion.service.js`)**

API client for all RAG-related operations.

### 4. **Assessment Page (`frontend/src/pages/student/RAGAssessmentPage.jsx`)**

Complete UI workflow:

- Chapter/subject selection
- Question generation
- Answer input
- Submission tracking

## How It Works

### Data Structure

Your RAG system has two types of data:

#### 1. **Structured JSON Files** (Recommended for Assessments)

```json
[
  {
    "chapter": "Set Theory",
    "questions": ["Define Cartesian product...", "If A = {1, 2, 3}..."]
  }
]
```

Located in: `python RAG/data/mathsclass10.json`, `mathsclass9.json`, `scienceclass10.json`

#### 2. **JSONL Files** (For RAG Context)

Contains content that can be embedded and searched using semantic search.

Located in: `python RAG/data/*.jsonl`

### Question Generation Flow

```
User selects chapter
    ↓
Frontend calls: POST /rag/generate-questions
    ↓
Backend checks structured data first
    ↓
If found: Returns existing questions from JSON
If not found: Uses RAG to generate questions
    ↓
Questions displayed to user
```

### Answer Submission Flow

```
User answers questions
    ↓
Frontend calls: POST /rag/submit-assessment
    ↓
Backend creates assessment record
    ↓
Answers stored in JSON file:
  assessments/{user_id}/{assessment_id}.json
    ↓
Status: "pending_evaluation"
```

### Assessment Storage Format

```json
{
  "chapter": "Set Theory",
  "subject": "maths",
  "answers": [
    {
      "question_id": "uuid-here",
      "answer": "Student's answer text..."
    }
  ],
  "submitted_at": "2025-12-24T10:30:00",
  "status": "pending_evaluation"
}
```

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
pip install mistralai faiss-cpu
```

Or use the updated requirements.txt:

```bash
pip install -r requirements.txt
```

### 2. Configure API Key

Already configured in `backend/app/core/config.py`:

```python
MISTRAL_API_KEY: Optional[str] = "CvKE1esO9Z2w9uBvOzoP9M4ZGBuWn99m"
```

### 3. Ensure Data Files Exist

The service expects data in: `python RAG/data/`

Current files:

- `mathsclass10.json` - Math questions for class 10
- `mathsclass9.json` - Math questions for class 9
- `scienceclass10.json` - Science questions for class 10
- Various `.jsonl` files for RAG context

### 4. Start Backend Server

```bash
cd backend
python main.py
```

### 5. Access the Assessment Page

Navigate to: `http://localhost:5174/dashboard/rag-assessment`

## Usage Guide for Users

### Step 1: Select Subject and Chapter

1. Choose a subject (maths, science, etc.)
2. Select a chapter from the dropdown
3. Set number of questions (1-20)
4. Choose difficulty level (easy, medium, hard)

### Step 2: Generate Questions

- Click "Generate Questions"
- Questions will be loaded from structured data
- If no structured data exists, RAG will generate questions using AI

### Step 3: Answer Questions

- Type answers in the text areas
- Progress indicator shows answered/total questions
- Can skip questions if needed

### Step 4: Submit Assessment

- Click "Submit Assessment"
- Answers are saved with status "pending_evaluation"
- Can start new assessment or view progress

## For Future Model Development

### Assessment Data Location

All submitted assessments are stored in:

```
assessments/{user_id}/{assessment_id}.json
```

Each file contains:

- Chapter and subject information
- Array of question IDs and user answers
- Submission timestamp
- Current status

### Evaluation Integration

When your AI evaluation model is ready, you can:

1. **Read assessment files**:

```python
import json
from pathlib import Path

def load_assessment(user_id, assessment_id):
    path = Path(f"assessments/{user_id}/{assessment_id}.json")
    with open(path) as f:
        return json.load(f)
```

2. **Evaluate answers**:

```python
def evaluate_assessment(assessment_data):
    # Your model logic here
    scores = []
    for answer in assessment_data['answers']:
        question_id = answer['question_id']
        user_answer = answer['answer']

        # Score the answer
        score = your_model.evaluate(question_id, user_answer)
        scores.append(score)

    return scores
```

3. **Update assessment status**:

```python
assessment_data['status'] = 'evaluated'
assessment_data['scores'] = scores
assessment_data['total_score'] = sum(scores)
assessment_data['evaluated_at'] = datetime.now().isoformat()

# Save back to file
with open(assessment_file, 'w') as f:
    json.dump(assessment_data, f, indent=2)
```

## Adding New Chapters/Subjects

### Option 1: Add Structured Data (Recommended)

Create or update JSON files in `python RAG/data/`:

```json
[
  {
    "chapter": "New Chapter Name",
    "questions": ["Question 1 text", "Question 2 text", "Question 3 text"]
  }
]
```

### Option 2: Add RAG Context (For AI Generation)

Create JSONL files with content:

```jsonl
{"id": "1", "text": "Chapter content here...", "section_label": "Introduction"}
{"id": "2", "text": "More content...", "section_label": "Main Concepts"}
```

The RAG service will use this content to generate contextual questions.

## API Usage Examples

### Generate Questions

```javascript
const response = await ragQuestionService.generateQuestions(
  "Set Theory", // chapter
  "maths", // subject
  5, // num_questions
  "medium" // difficulty
);
```

### Submit Assessment

```javascript
const response = await ragQuestionService.submitAssessment(
  "Set Theory",
  "maths",
  [
    { question_id: "uuid-1", answer: "Answer 1" },
    { question_id: "uuid-2", answer: "Answer 2" },
  ]
);
```

### Get User Assessments

```javascript
const response = await ragQuestionService.getUserAssessments();
// Returns all assessments for logged-in user
```

## Troubleshooting

### Issue: "RAG service not configured"

**Solution**: Ensure MISTRAL_API_KEY is set in config.py

### Issue: "Failed to load chapters"

**Solution**: Check that data files exist in `python RAG/data/`

### Issue: Questions not generating

**Solution**:

1. Verify Mistral AI API key is valid
2. Check backend console for errors
3. Ensure data files are properly formatted JSON

### Issue: Assessment not submitting

**Solution**:

1. Check that user is authenticated
2. Verify `assessments/` directory has write permissions
3. Look for errors in browser console

## Future Enhancements

1. **Real-time Question Generation**: Generate questions on-the-fly using RAG instead of structured data
2. **Evaluation API**: Add endpoint for AI model to evaluate and score assessments
3. **Progress Tracking**: Link assessments to progress system
4. **Question Bank**: Build database of generated questions for reuse
5. **Difficulty Adaptation**: Adjust question difficulty based on student performance
6. **Multi-modal Support**: Add support for image-based questions
7. **Batch Evaluation**: Process multiple assessments at once when model is ready

## Summary

The RAG system is now fully integrated with your EduAssess application. Students can:

- Generate chapter-specific questions
- Answer questions in a user-friendly interface
- Submit assessments for future evaluation
- Track their assessment history

All submitted answers are stored in a structured format ready for your AI evaluation model when it's developed.
