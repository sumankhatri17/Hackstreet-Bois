"""
API routes for RAG-based question generation
"""
import json
from pathlib import Path
from typing import List, Optional

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.db.database import get_db
from app.models.assessment import Assessment
from app.models.user import User
from app.services.rag_service import RAGService
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()

# Initialize RAG service
RAG_DATA_FOLDER = Path(__file__).parent.parent.parent.parent / "python_RAG" / "data"
MISTRAL_API_KEY = settings.MISTRAL_API_KEY if hasattr(settings, 'MISTRAL_API_KEY') else None

rag_service = None

def get_rag_service():
    """Get or initialize RAG service"""
    global rag_service
    
    if rag_service is None:
        if not MISTRAL_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="RAG service not configured. MISTRAL_API_KEY is missing."
            )
        
        try:
            rag_service = RAGService(api_key=MISTRAL_API_KEY, data_folder=str(RAG_DATA_FOLDER))
            print("RAG service initialized successfully")
        except Exception as e:
            print(f"Error initializing RAG service: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to initialize RAG service: {str(e)}"
            )
    
    return rag_service


# Request/Response Models
class QuestionGenerationRequest(BaseModel):
    chapter: Optional[str] = None
    subject: str
    num_questions: int = 5


class GeneratedQuestion(BaseModel):
    id: str
    question: str
    chapter: str
    subject: str
    type: str
    order: int


class QuestionGenerationResponse(BaseModel):
    questions: List[GeneratedQuestion]
    chapter: str
    subject: str
    total_generated: int


class AnswerSubmission(BaseModel):
    question_id: str
    answer: str
    chapter: Optional[str] = None
    question: Optional[str] = None


class AssessmentSubmission(BaseModel):
    chapter: str
    subject: str
    answers: List[AnswerSubmission]


class AssessmentResponse(BaseModel):
    assessment_id: str
    chapter: str
    subject: str
    total_questions: int
    submitted_at: str
    status: str


@router.post("/generate-questions", response_model=QuestionGenerationResponse)
async def generate_questions(
    request: QuestionGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate questions by subject (5 questions from each chapter)
    """
    try:
        service = get_rag_service()
        
        # If chapter is provided, generate for that chapter only (backward compatibility)
        if request.chapter:
            questions = service.generate_questions_from_chapter(
                chapter_name=request.chapter,
                subject=request.subject,
                num_questions=request.num_questions
            )
            chapter_name = request.chapter
        else:
            # Generate questions from all chapters in the subject
            questions = service.generate_questions_by_subject(
                subject=request.subject,
                questions_per_chapter=1
            )
            chapter_name = "All Chapters"
        
        return QuestionGenerationResponse(
            questions=[GeneratedQuestion(**q) for q in questions],
            chapter=chapter_name,
            subject=request.subject or questions[0].get("subject", "general") if questions else "general",
            total_generated=len(questions)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate questions: {str(e)}"
        )


@router.get("/available-chapters")
async def get_available_chapters(
    subject: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get list of available subjects and example chapters
    Since we're using AI to generate questions, we return common educational chapters
    """
    
    # Common chapters by subject for Class 10
    all_chapters = {
        "maths": [
            "Real Numbers",
            "Polynomials",
            "Linear Equations",
            "Quadratic Equations",
            "Arithmetic Progressions",
            "Triangles",
            "Coordinate Geometry",
            "Trigonometry",
            "Circles",
            "Statistics",
            "Probability"
        ],
        "science": [
            "Chemical Reactions",
            "Acids Bases and Salts",
            "Metals and Non-metals",
            "Carbon Compounds",
            "Periodic Classification",
            "Life Processes",
            "Control and Coordination",
            "Reproduction",
            "Heredity and Evolution",
            "Light Reflection and Refraction",
            "Human Eye",
            "Electricity",
            "Magnetic Effects of Current"
        ],
        "english": [
            "Reading Comprehension",
            "Grammar",
            "Writing Skills",
            "Literature",
            "Poetry Analysis",
            "Essay Writing",
            "Letter Writing"
        ]
    }
    
    if subject:
        subject_lower = subject.lower()
        if subject_lower in all_chapters:
            return {
                "subject": subject_lower,
                "chapters": [{"name": ch, "available": True} for ch in all_chapters[subject_lower]]
            }
        else:
            return {"subject": subject_lower, "chapters": []}
    
    # Return all subjects and their chapters
    return {
        "subjects": {
            subj: [{"name": ch, "available": True} for ch in chapters]
            for subj, chapters in all_chapters.items()
        }
    }


@router.post("/submit-assessment", response_model=AssessmentResponse)
async def submit_assessment(
    submission: AssessmentSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit answers for an assessment
    Stores the answers in JSON format for later evaluation
    """
    import uuid
    from datetime import datetime
    
    try:
        # Create assessment record
        assessment_data = {
            "chapter": submission.chapter,
            "subject": submission.subject,
            "answers": [
                {
                    "question_id": ans.question_id,
                    "answer": ans.answer,
                    "chapter": ans.chapter,
                    "question": ans.question
                }
                for ans in submission.answers
            ],
            "submitted_at": datetime.utcnow().isoformat(),
            "status": "pending_evaluation"
        }
        
        # Save to database (you can expand this based on your schema)
        # For now, we'll create a simple assessment record
        
        # Create a file-based storage for now (you can move this to DB later)
        assessments_dir = Path(__file__).parent.parent.parent.parent / "assessments"
        assessments_dir.mkdir(exist_ok=True)
        
        assessment_id = str(uuid.uuid4())
        user_dir = assessments_dir / str(current_user.id)
        user_dir.mkdir(exist_ok=True)
        
        assessment_file = user_dir / f"{assessment_id}.json"
        
        with open(assessment_file, "w", encoding="utf-8") as f:
            json.dump(assessment_data, f, indent=2)
        
        return AssessmentResponse(
            assessment_id=assessment_id,
            chapter=submission.chapter,
            subject=submission.subject,
            total_questions=len(submission.answers),
            submitted_at=assessment_data["submitted_at"],
            status=assessment_data["status"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit assessment: {str(e)}"
        )


@router.get("/user-assessments")
async def get_user_assessments(
    current_user: User = Depends(get_current_user)
):
    """
    Get all assessments submitted by the current user
    """
    try:
        assessments_dir = Path(__file__).parent.parent.parent.parent / "assessments"
        user_dir = assessments_dir / str(current_user.id)
        
        if not user_dir.exists():
            return {"assessments": []}
        
        assessments = []
        for assessment_file in user_dir.glob("*.json"):
            try:
                with open(assessment_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    data["assessment_id"] = assessment_file.stem
                    assessments.append(data)
            except Exception as e:
                print(f"Error loading assessment {assessment_file}: {e}")
        
        # Sort by submitted_at (most recent first)
        assessments.sort(key=lambda x: x.get("submitted_at", ""), reverse=True)
        
        return {"assessments": assessments}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load assessments: {str(e)}"
        )


@router.get("/assessment/{assessment_id}")
async def get_assessment_details(
    assessment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific assessment
    """
    try:
        assessments_dir = Path(__file__).parent.parent.parent.parent / "assessments"
        user_dir = assessments_dir / str(current_user.id)
        assessment_file = user_dir / f"{assessment_id}.json"
        
        if not assessment_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        
        with open(assessment_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            data["assessment_id"] = assessment_id
        
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load assessment: {str(e)}"
        )
