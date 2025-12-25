"""
Pydantic schemas for peer-to-peer matching
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# StudentChapterPerformance Schemas
class StudentChapterPerformanceBase(BaseModel):
    subject: str
    chapter: str
    score: float
    accuracy_percentage: int
    weakness_level: str
    total_questions_attempted: int = 0
    correct_answers: int = 0
    is_strong_chapter: bool = False
    is_weak_chapter: bool = False


class StudentChapterPerformanceCreate(StudentChapterPerformanceBase):
    student_id: int


class StudentChapterPerformance(StudentChapterPerformanceBase):
    id: int
    student_id: int
    last_assessed_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# PeerMatch Schemas
class PeerMatchBase(BaseModel):
    chapter: str
    subject: str
    tutor_score: float
    learner_score: float
    compatibility_score: Optional[float] = None
    preference_rank_tutor: Optional[int] = None
    preference_rank_learner: Optional[int] = None


class PeerMatchCreate(PeerMatchBase):
    tutor_id: int
    learner_id: int


class PeerMatch(PeerMatchBase):
    id: int
    tutor_id: int
    learner_id: int
    status: str
    matched_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PeerMatchWithDetails(PeerMatch):
    """Match with tutor and learner details"""
    tutor_name: str
    tutor_email: str
    learner_name: str
    learner_email: str
    tutor_school: Optional[str] = None
    learner_school: Optional[str] = None


# TutoringSession Schemas
class TutoringSessionBase(BaseModel):
    topics_covered: Optional[List[str]] = None
    notes: Optional[str] = None
    tutor_rating: Optional[int] = Field(None, ge=1, le=5)
    learner_rating: Optional[int] = Field(None, ge=1, le=5)
    tutor_feedback: Optional[str] = None
    learner_feedback: Optional[str] = None
    learner_progress: Optional[float] = None


class TutoringSessionCreate(TutoringSessionBase):
    match_id: int
    scheduled_at: Optional[datetime] = None


class TutoringSessionUpdate(TutoringSessionBase):
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None


class TutoringSession(TutoringSessionBase):
    id: int
    match_id: int
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Matching Request/Response Schemas
class MatchingRequest(BaseModel):
    subject: str
    chapter: str
    school_id: Optional[int] = None


class MatchingResponse(BaseModel):
    success: bool
    message: str
    matches_created: int
    matches: List[PeerMatchWithDetails]


class StudentMatchesResponse(BaseModel):
    tutoring_matches: List[PeerMatchWithDetails]  # Where student is tutor
    learning_matches: List[PeerMatchWithDetails]  # Where student is learner
    total_matches: int


class MatchStatusUpdate(BaseModel):
    status: str  # 'accepted', 'rejected', 'completed'


class ChapterListResponse(BaseModel):
    """Available chapters for matching"""
    subject: str
    chapters: List[str]
    total_students: int


class MatchingStatsResponse(BaseModel):
    """Statistics about matching"""
    total_potential_tutors: int
    total_potential_learners: int
    chapters_available: List[str]
    subjects_available: List[str]


# Help Request/Offer Schemas
class HelpRequestBase(BaseModel):
    subject: str
    chapter: str
    description: Optional[str] = None
    urgency: str = "normal"  # low, normal, high, urgent


class HelpRequestCreate(HelpRequestBase):
    pass


class HelpRequest(HelpRequestBase):
    id: int
    student_id: int
    student_score: Optional[float] = None
    status: str
    matched_with: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    fulfilled_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class HelpRequestWithDetails(HelpRequest):
    """Help request with student details"""
    student_name: str
    student_email: str
    student_school: Optional[str] = None
    tutor_name: Optional[str] = None


class HelpOfferBase(BaseModel):
    subject: str
    chapter: str
    description: Optional[str] = None
    availability: Optional[str] = None
    max_students: int = 3


class HelpOfferCreate(HelpOfferBase):
    pass


class HelpOffer(HelpOfferBase):
    id: int
    tutor_id: int
    tutor_score: Optional[float] = None
    is_active: bool
    current_students: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class HelpOfferWithDetails(HelpOffer):
    """Help offer with tutor details"""
    tutor_name: str
    tutor_email: str
    tutor_school: Optional[str] = None


# Potential Match Schemas
class PotentialTutor(BaseModel):
    """Potential tutor for a student"""
    student_id: int
    name: str
    email: str
    score: float
    accuracy: int
    compatibility_score: float
    school: Optional[str] = None


class PotentialLearner(BaseModel):
    """Potential learner for a tutor"""
    student_id: int
    name: str
    email: str
    score: float
    accuracy: int
    compatibility_score: float
    school: Optional[str] = None


class PotentialMatchesResponse(BaseModel):
    """Automatic suggestions for potential matches"""
    subject: str
    chapter: str
    student_score: Optional[float] = None
    can_tutor: bool
    can_learn: bool
    potential_tutors: List[PotentialTutor] = []
    potential_learners: List[PotentialLearner] = []


class DirectMatchRequest(BaseModel):
    """Request to create a direct match with a specific student"""
    peer_student_id: int
    subject: str
    chapter: str
    message: Optional[str] = None
