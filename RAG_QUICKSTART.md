# RAG Assessment System - Quick Start

## Installation

1. Install Python dependencies:

```bash
cd backend
pip install mistralai faiss-cpu numpy
```

2. Backend is already configured with Mistral API key in `app/core/config.py`

3. Start the backend (if not already running):

```bash
cd backend
python main.py
```

4. Access the new RAG Assessment page:

```
http://localhost:5174/dashboard/rag-assessment
```

## What's Been Implemented

### Backend

✅ **RAG Service** (`app/services/rag_service.py`)

- Loads data from your `python RAG/data/` folder
- Supports both structured JSON (mathsclass10.json) and JSONL files
- Generates questions using Mistral AI
- Creates embeddings with FAISS for semantic search

✅ **API Routes** (`app/api/routes/rag_questions.py`)

- `/api/v1/rag/generate-questions` - Generate questions by chapter
- `/api/v1/rag/available-chapters` - Get all chapters organized by subject
- `/api/v1/rag/submit-assessment` - Submit answers
- `/api/v1/rag/user-assessments` - Get user's assessment history
- `/api/v1/rag/assessment/{id}` - Get specific assessment details

✅ **Configuration**

- Mistral API key added to config.py
- RAG routes registered in API router

### Frontend

✅ **RAG Service** (`services/ragQuestion.service.js`)

- API client for all RAG operations

✅ **Assessment Page** (`pages/student/RAGAssessmentPage.jsx`)

- Complete assessment workflow UI
- Chapter/subject selection
- Question generation
- Answer input with progress tracking
- Submission confirmation

✅ **Routing**

- New route: `/dashboard/rag-assessment`
- Protected by authentication

## How It Works

### For Students:

1. Go to RAG Assessment page
2. Select subject (maths, science, etc.)
3. Choose a chapter
4. Set number of questions and difficulty
5. Click "Generate Questions"
6. Answer the questions
7. Submit assessment

### Data Flow:

```
Student Selection
    ↓
Questions loaded from structured data (mathsclass10.json, etc.)
    ↓
Student answers questions
    ↓
Answers saved to: assessments/{user_id}/{assessment_id}.json
    ↓
Status: "pending_evaluation"
    ↓
[Your AI model will evaluate later]
```

### Assessment Storage:

Each submitted assessment creates a JSON file:

```json
{
  "chapter": "Set Theory",
  "subject": "maths",
  "answers": [
    {
      "question_id": "uuid-123",
      "answer": "Student's answer..."
    }
  ],
  "submitted_at": "2025-12-24T10:30:00",
  "status": "pending_evaluation"
}
```

## Available Data

Your `python RAG/data/` folder contains:

- **mathsclass10.json** - Math questions for class 10
- **mathsclass9.json** - Math questions for class 9
- **scienceclass10.json** - Science questions for class 10
- **Various .jsonl files** - Additional content for RAG context

## Next Steps for Model Development

When your AI evaluation model is ready:

1. **Read assessments from** `assessments/{user_id}/` directory
2. **Each file contains**:
   - Question IDs and student answers
   - Chapter and subject context
   - Submission timestamp
3. **Evaluate the answers** using your model
4. **Update the JSON** with scores and evaluation status
5. **Integrate with progress tracking** to show results to students

## Testing

1. Login to the application
2. Navigate to: Dashboard → RAG Assessment
3. Select "maths" subject
4. Choose "Set Theory" chapter
5. Generate 5 medium difficulty questions
6. Answer a few questions
7. Submit the assessment
8. Check `assessments/` folder for saved JSON file

## Troubleshooting

**"RAG service not configured"**

- Check that Mistral API key is in `backend/app/core/config.py`

**No chapters showing**

- Verify `python RAG/data/` folder contains JSON files
- Check backend console for errors

**Can't submit**

- Ensure you're logged in
- Check that `assessments/` directory exists and is writable

## Adding New Content

### Add new chapters:

Edit or create files in `python RAG/data/`:

```json
[
  {
    "chapter": "Your Chapter Name",
    "questions": ["Question 1", "Question 2"]
  }
]
```

### Add context for RAG generation:

Create `.jsonl` files with educational content that RAG can use to generate questions.

---

**See `RAG_INTEGRATION_GUIDE.md` for complete technical documentation.**
