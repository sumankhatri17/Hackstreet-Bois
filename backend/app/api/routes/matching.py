"""
API routes for peer-to-peer matching
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User, UserRole
from app.models.matching import (
    PeerMatch, 
    StudentChapterPerformance, 
    MatchStatus,
    HelpRequest,
    HelpOffer,
    HelpRequestStatus
)
from app.schemas import matching as matching_schemas
from app.services.matching_service import get_peer_matching_service


router = APIRouter()


@router.post("/update-performance/{user_id}")
def update_student_performance(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Update student chapter performance from evaluation files.
    Should be called after assessment evaluation is complete.
    """
    # Check authorization
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER] and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this student's performance"
        )
    
    matching_service = get_peer_matching_service(db)
    matching_service.update_student_chapter_performances(user_id)
    
    return {"message": "Performance data updated successfully", "user_id": user_id}


@router.post("/create-matches", response_model=matching_schemas.MatchingResponse)
def create_chapter_matches(
    request: matching_schemas.MatchingRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Create peer-to-peer matches for a specific chapter using Gale-Shapley algorithm.
    Only teachers and admins can create matches.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create matches"
        )
    
    matching_service = get_peer_matching_service(db)
    
    # Create matches
    matches = matching_service.create_matches(
        subject=request.subject,
        chapter=request.chapter,
        school_id=request.school_id or current_user.school_id,
    )
    
    # Build detailed response
    matches_with_details = []
    for match in matches:
        tutor = db.query(User).filter(User.id == match.tutor_id).first()
        learner = db.query(User).filter(User.id == match.learner_id).first()
        
        if tutor and learner:
            matches_with_details.append(
                matching_schemas.PeerMatchWithDetails(
                    id=match.id,
                    tutor_id=match.tutor_id,
                    learner_id=match.learner_id,
                    chapter=match.chapter,
                    subject=match.subject,
                    tutor_score=match.tutor_score,
                    learner_score=match.learner_score,
                    compatibility_score=match.compatibility_score,
                    preference_rank_tutor=match.preference_rank_tutor,
                    preference_rank_learner=match.preference_rank_learner,
                    status=match.status.value,
                    matched_at=match.matched_at,
                    accepted_at=match.accepted_at,
                    completed_at=match.completed_at,
                    tutor_name=tutor.name,
                    tutor_email=tutor.email,
                    learner_name=learner.name,
                    learner_email=learner.email,
                    tutor_school=tutor.school.name if tutor.school else None,
                    learner_school=learner.school.name if learner.school else None,
                )
            )
    
    return matching_schemas.MatchingResponse(
        success=True,
        message=f"Created {len(matches)} matches for {request.chapter}",
        matches_created=len(matches),
        matches=matches_with_details,
    )


@router.get("/my-matches", response_model=matching_schemas.StudentMatchesResponse)
def get_my_matches(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get all matches for the current student.
    Returns separate lists for tutoring and learning matches.
    """
    matching_service = get_peer_matching_service(db)
    
    # Get matches where student is tutor
    tutoring_matches = matching_service.get_student_matches(current_user.id, role='tutor')
    
    # Get matches where student is learner
    learning_matches = matching_service.get_student_matches(current_user.id, role='learner')
    
    # Build detailed responses
    def build_match_details(match: PeerMatch) -> matching_schemas.PeerMatchWithDetails:
        tutor = db.query(User).filter(User.id == match.tutor_id).first()
        learner = db.query(User).filter(User.id == match.learner_id).first()
        
        return matching_schemas.PeerMatchWithDetails(
            id=match.id,
            tutor_id=match.tutor_id,
            learner_id=match.learner_id,
            chapter=match.chapter,
            subject=match.subject,
            tutor_score=match.tutor_score,
            learner_score=match.learner_score,
            compatibility_score=match.compatibility_score,
            preference_rank_tutor=match.preference_rank_tutor,
            preference_rank_learner=match.preference_rank_learner,
            status=match.status.value,
            matched_at=match.matched_at,
            accepted_at=match.accepted_at,
            completed_at=match.completed_at,
            tutor_name=tutor.name if tutor else "Unknown",
            tutor_email=tutor.email if tutor else "",
            learner_name=learner.name if learner else "Unknown",
            learner_email=learner.email if learner else "",
            tutor_school=tutor.school.name if tutor and tutor.school else None,
            learner_school=learner.school.name if learner and learner.school else None,
        )
    
    tutoring_details = [build_match_details(m) for m in tutoring_matches]
    learning_details = [build_match_details(m) for m in learning_matches]
    
    return matching_schemas.StudentMatchesResponse(
        tutoring_matches=tutoring_details,
        learning_matches=learning_details,
        total_matches=len(tutoring_matches) + len(learning_matches),
    )


@router.patch("/match/{match_id}/status")
def update_match_status(
    match_id: int,
    status_update: matching_schemas.MatchStatusUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Update the status of a match (accept, reject, complete).
    Students can only update their own matches.
    """
    match = db.query(PeerMatch).filter(PeerMatch.id == match_id).first()
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    
    # Verify user is part of this match
    if current_user.id not in [match.tutor_id, match.learner_id]:
        if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this match"
            )
    
    # Update status
    try:
        new_status = MatchStatus(status_update.status)
        match.status = new_status
        
        # Update timestamps
        from datetime import datetime
        if new_status == MatchStatus.ACCEPTED and not match.accepted_at:
            match.accepted_at = datetime.utcnow()
        elif new_status == MatchStatus.COMPLETED and not match.completed_at:
            match.completed_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "Match status updated", "match_id": match_id, "status": new_status.value}
    
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {status_update.status}"
        )


@router.get("/available-chapters", response_model=List[matching_schemas.ChapterListResponse])
def get_available_chapters(
    subject: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get list of chapters available for matching, grouped by subject.
    """
    query = db.query(
        StudentChapterPerformance.subject,
        StudentChapterPerformance.chapter,
    ).distinct()
    
    if subject:
        query = query.filter(StudentChapterPerformance.subject == subject)
    
    if current_user.school_id:
        from app.models.user import User as UserModel
        query = query.join(UserModel).filter(UserModel.school_id == current_user.school_id)
    
    results = query.all()
    
    # Group by subject
    subject_chapters = {}
    for subj, chapter in results:
        if subj not in subject_chapters:
            subject_chapters[subj] = []
        subject_chapters[subj].append(chapter)
    
    # Build response
    response = []
    for subj, chapters in subject_chapters.items():
        # Count students with performance in this subject
        student_count = db.query(StudentChapterPerformance.student_id).filter(
            StudentChapterPerformance.subject == subj
        ).distinct().count()
        
        response.append(
            matching_schemas.ChapterListResponse(
                subject=subj,
                chapters=sorted(chapters),
                total_students=student_count,
            )
        )
    
    return response


@router.get("/stats", response_model=matching_schemas.MatchingStatsResponse)
def get_matching_stats(
    subject: Optional[str] = None,
    chapter: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get statistics about potential tutors and learners.
    """
    from app.services.matching_service import AsymmetricGaleShapleyMatcher
    
    matcher = AsymmetricGaleShapleyMatcher()
    
    # Base query
    query = db.query(StudentChapterPerformance)
    
    if subject:
        query = query.filter(StudentChapterPerformance.subject == subject)
    if chapter:
        query = query.filter(StudentChapterPerformance.chapter == chapter)
    
    if current_user.school_id:
        from app.models.user import User as UserModel
        query = query.join(UserModel).filter(UserModel.school_id == current_user.school_id)
    
    all_performances = query.all()
    
    # Count potential tutors and learners
    tutors = set()
    learners = set()
    chapters_set = set()
    subjects_set = set()
    
    for perf in all_performances:
        subjects_set.add(perf.subject)
        chapters_set.add(perf.chapter)
        
        if perf.score >= matcher.tutor_threshold:
            tutors.add(perf.student_id)
        if perf.score <= matcher.learner_threshold:
            learners.add(perf.student_id)
    
    return matching_schemas.MatchingStatsResponse(
        total_potential_tutors=len(tutors),
        total_potential_learners=len(learners),
        chapters_available=sorted(list(chapters_set)),
        subjects_available=sorted(list(subjects_set)),
    )


@router.get("/student/{student_id}/performance", response_model=List[matching_schemas.StudentChapterPerformance])
def get_student_performance(
    student_id: int,
    subject: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get chapter performance for a specific student.
    """
    # Authorization check
    if current_user.id != student_id and current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this student's performance"
        )
    
    query = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == student_id
    )
    
    if subject:
        query = query.filter(StudentChapterPerformance.subject == subject)
    
    performances = query.all()
    
    return [
        matching_schemas.StudentChapterPerformance(
            id=p.id,
            student_id=p.student_id,
            subject=p.subject,
            chapter=p.chapter,
            score=p.score,
            accuracy_percentage=p.accuracy_percentage,
            weakness_level=p.weakness_level,
            total_questions_attempted=p.total_questions_attempted,
            correct_answers=p.correct_answers,
            is_strong_chapter=p.is_strong_chapter,
            is_weak_chapter=p.is_weak_chapter,
            last_assessed_at=p.last_assessed_at,
            updated_at=p.updated_at,
        )
        for p in performances
    ]


@router.get("/potential-matches", response_model=matching_schemas.PotentialMatchesResponse)
def get_potential_matches(
    subject: str,
    chapter: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get automatic suggestions for potential tutors/learners for the current student.
    Shows who they can learn from and who they can teach.
    """
    matching_service = get_peer_matching_service(db)
    
    # Get student's performance
    student_perf = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == current_user.id,
        StudentChapterPerformance.subject == subject,
        StudentChapterPerformance.chapter == chapter,
    ).first()
    
    # Initialize response
    can_tutor = False
    can_learn = False
    potential_tutors = []
    potential_learners = []
    student_score = None
    
    if student_perf:
        student_score = student_perf.score
        
        # Check if student can be a tutor
        if student_perf.score >= matching_service.matcher.tutor_threshold:
            can_tutor = True
            # Get potential learners they can help
            learners = matching_service.get_potential_learners_for_student(
                current_user.id, subject, chapter, limit=10
            )
            potential_learners = [
                matching_schemas.PotentialLearner(
                    student_id=learner_id,
                    name=data['name'],
                    email=data['email'],
                    score=data['score'],
                    accuracy=data['accuracy'],
                    compatibility_score=compatibility,
                    school=data['school'],
                )
                for learner_id, compatibility, data in learners
            ]
        
        # Check if student needs help
        if student_perf.score <= matching_service.matcher.learner_threshold:
            can_learn = True
            # Get potential tutors who can help them
            tutors = matching_service.get_potential_tutors_for_student(
                current_user.id, subject, chapter, limit=10
            )
            potential_tutors = [
                matching_schemas.PotentialTutor(
                    student_id=tutor_id,
                    name=data['name'],
                    email=data['email'],
                    score=data['score'],
                    accuracy=data['accuracy'],
                    compatibility_score=compatibility,
                    school=data['school'],
                )
                for tutor_id, compatibility, data in tutors
            ]
    
    return matching_schemas.PotentialMatchesResponse(
        subject=subject,
        chapter=chapter,
        student_score=student_score,
        can_tutor=can_tutor,
        can_learn=can_learn,
        potential_tutors=potential_tutors,
        potential_learners=potential_learners,
    )


@router.get("/all-potential-matches")
def get_all_potential_matches(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get all potential matches for the current student across all chapters.
    Returns chapters where they can tutor others and chapters where they need help.
    """
    matching_service = get_peer_matching_service(db)
    
    # Get all student's performance data
    student_performances = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == current_user.id
    ).all()
    
    potential_matches = []
    
    for perf in student_performances:
        # Check if student can be a tutor for this chapter
        if perf.score >= matching_service.matcher.tutor_threshold:
            # Get potential learners
            learners = matching_service.get_potential_learners_for_student(
                current_user.id, perf.subject, perf.chapter, limit=5
            )
            for learner_id, compatibility, data in learners:
                potential_matches.append({
                    'as_tutor': True,
                    'as_learner': False,
                    'subject': perf.subject,
                    'chapter': perf.chapter,
                    'tutor_id': current_user.id,
                    'tutor_name': current_user.name,
                    'tutor_score': perf.score,
                    'learner_id': learner_id,
                    'learner_name': data['name'],
                    'learner_score': data['score'],
                    'compatibility_score': compatibility,
                })
        
        # Check if student needs help for this chapter
        if perf.score <= matching_service.matcher.learner_threshold:
            # Get potential tutors
            tutors = matching_service.get_potential_tutors_for_student(
                current_user.id, perf.subject, perf.chapter, limit=5
            )
            for tutor_id, compatibility, data in tutors:
                potential_matches.append({
                    'as_tutor': False,
                    'as_learner': True,
                    'subject': perf.subject,
                    'chapter': perf.chapter,
                    'tutor_id': tutor_id,
                    'tutor_name': data['name'],
                    'tutor_score': data['score'],
                    'learner_id': current_user.id,
                    'learner_name': current_user.name,
                    'learner_score': perf.score,
                    'compatibility_score': compatibility,
                })
    
    return {
        'potential_matches': potential_matches,
        'total_count': len(potential_matches)
    }


@router.post("/request-help", response_model=matching_schemas.HelpRequest)
def request_help(
    request: matching_schemas.HelpRequestCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Student requests help in a specific chapter.
    This creates a help request that tutors can see and accept.
    """
    # Get student's score in this chapter
    student_perf = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == current_user.id,
        StudentChapterPerformance.subject == request.subject,
        StudentChapterPerformance.chapter == request.chapter,
    ).first()
    
    student_score = student_perf.score if student_perf else None
    
    # Create help request
    help_request = HelpRequest(
        student_id=current_user.id,
        subject=request.subject,
        chapter=request.chapter,
        description=request.description,
        urgency=request.urgency,
        student_score=student_score,
        status=HelpRequestStatus.OPEN,
    )
    
    db.add(help_request)
    db.commit()
    db.refresh(help_request)
    
    return help_request


@router.get("/help-requests", response_model=List[matching_schemas.HelpRequestWithDetails])
def get_help_requests(
    subject: Optional[str] = None,
    chapter: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get help requests. Students see their own, tutors see open requests they can help with.
    """
    query = db.query(HelpRequest)
    
    if current_user.role == UserRole.STUDENT:
        # Students see only their own requests
        query = query.filter(HelpRequest.student_id == current_user.id)
    else:
        # Teachers/admins see all
        pass
    
    if subject:
        query = query.filter(HelpRequest.subject == subject)
    if chapter:
        query = query.filter(HelpRequest.chapter == chapter)
    if status:
        query = query.filter(HelpRequest.status == status)
    
    requests = query.order_by(HelpRequest.created_at.desc()).all()
    
    # Build detailed response
    result = []
    for req in requests:
        student = db.query(User).filter(User.id == req.student_id).first()
        tutor = db.query(User).filter(User.id == req.matched_with).first() if req.matched_with else None
        
        if student:
            result.append(
                matching_schemas.HelpRequestWithDetails(
                    id=req.id,
                    student_id=req.student_id,
                    subject=req.subject,
                    chapter=req.chapter,
                    description=req.description,
                    urgency=req.urgency,
                    student_score=req.student_score,
                    status=req.status.value,
                    matched_with=req.matched_with,
                    created_at=req.created_at,
                    updated_at=req.updated_at,
                    fulfilled_at=req.fulfilled_at,
                    student_name=student.name,
                    student_email=student.email,
                    student_school=student.school.name if student.school else None,
                    tutor_name=tutor.name if tutor else None,
                )
            )
    
    return result


@router.post("/offer-help", response_model=matching_schemas.HelpOffer)
def offer_help(
    offer: matching_schemas.HelpOfferCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Student offers to help others in a specific chapter.
    This creates a help offer that learners can see.
    """
    # Get student's score in this chapter
    student_perf = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == current_user.id,
        StudentChapterPerformance.subject == offer.subject,
        StudentChapterPerformance.chapter == offer.chapter,
    ).first()
    
    tutor_score = student_perf.score if student_perf else None
    
    # Check if student qualifies to tutor
    matching_service = get_peer_matching_service(db)
    if tutor_score and tutor_score < matching_service.matcher.tutor_threshold:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Your score ({tutor_score}/10) is below the tutoring threshold ({matching_service.matcher.tutor_threshold}/10)"
        )
    
    # Create help offer
    help_offer = HelpOffer(
        tutor_id=current_user.id,
        subject=offer.subject,
        chapter=offer.chapter,
        description=offer.description,
        availability=offer.availability,
        tutor_score=tutor_score,
        max_students=offer.max_students,
        is_active=True,
        current_students=0,
    )
    
    db.add(help_offer)
    db.commit()
    db.refresh(help_offer)
    
    return help_offer


@router.get("/help-offers", response_model=List[matching_schemas.HelpOfferWithDetails])
def get_help_offers(
    subject: Optional[str] = None,
    chapter: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get available help offers from tutors.
    """
    query = db.query(HelpOffer)
    
    if active_only:
        query = query.filter(HelpOffer.is_active == True)
    
    if subject:
        query = query.filter(HelpOffer.subject == subject)
    if chapter:
        query = query.filter(HelpOffer.chapter == chapter)
    
    offers = query.order_by(HelpOffer.tutor_score.desc()).all()
    
    # Build detailed response
    result = []
    for offer in offers:
        tutor = db.query(User).filter(User.id == offer.tutor_id).first()
        
        if tutor:
            result.append(
                matching_schemas.HelpOfferWithDetails(
                    id=offer.id,
                    tutor_id=offer.tutor_id,
                    subject=offer.subject,
                    chapter=offer.chapter,
                    description=offer.description,
                    availability=offer.availability,
                    tutor_score=offer.tutor_score,
                    max_students=offer.max_students,
                    is_active=offer.is_active,
                    current_students=offer.current_students,
                    created_at=offer.created_at,
                    updated_at=offer.updated_at,
                    tutor_name=tutor.name,
                    tutor_email=tutor.email,
                    tutor_school=tutor.school.name if tutor.school else None,
                )
            )
    
    return result


@router.post("/accept-help-request/{request_id}")
def accept_help_request(
    request_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Tutor accepts a help request and creates a match.
    """
    help_request = db.query(HelpRequest).filter(HelpRequest.id == request_id).first()
    
    if not help_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Help request not found")
    
    if help_request.status != HelpRequestStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Help request is no longer open")
    
    # Verify tutor qualification
    tutor_perf = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == current_user.id,
        StudentChapterPerformance.subject == help_request.subject,
        StudentChapterPerformance.chapter == help_request.chapter,
    ).first()
    
    matching_service = get_peer_matching_service(db)
    if not tutor_perf or tutor_perf.score < matching_service.matcher.tutor_threshold:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You don't meet the tutoring requirements for this chapter"
        )
    
    # Get learner performance
    learner_perf = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == help_request.student_id,
        StudentChapterPerformance.subject == help_request.subject,
        StudentChapterPerformance.chapter == help_request.chapter,
    ).first()
    
    # Calculate compatibility
    compatibility = matching_service.matcher.calculate_compatibility_score(
        tutor_perf.score,
        learner_perf.score if learner_perf else 0,
    )
    
    # Create match
    match = PeerMatch(
        tutor_id=current_user.id,
        learner_id=help_request.student_id,
        chapter=help_request.chapter,
        subject=help_request.subject,
        tutor_score=tutor_perf.score,
        learner_score=learner_perf.score if learner_perf else 0,
        compatibility_score=compatibility,
        status=MatchStatus.PENDING,
    )
    
    db.add(match)
    
    # Update help request
    help_request.status = HelpRequestStatus.IN_PROGRESS
    help_request.matched_with = current_user.id
    from datetime import datetime
    help_request.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Help request accepted", "match_id": match.id, "request_id": request_id}


@router.post("/connect-with-peer")
def connect_with_peer(
    request: matching_schemas.DirectMatchRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Create a direct match request between two students.
    Either a tutor reaching out to a learner or vice versa.
    """
    matching_service = get_peer_matching_service(db)
    
    # Get both students' performances
    my_perf = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == current_user.id,
        StudentChapterPerformance.subject == request.subject,
        StudentChapterPerformance.chapter == request.chapter,
    ).first()
    
    peer_perf = db.query(StudentChapterPerformance).filter(
        StudentChapterPerformance.student_id == request.peer_student_id,
        StudentChapterPerformance.subject == request.subject,
        StudentChapterPerformance.chapter == request.chapter,
    ).first()
    
    if not my_perf or not peer_perf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both students must have performance data for this chapter"
        )
    
    # Determine who is tutor and who is learner
    if my_perf.score > peer_perf.score:
        tutor_id, learner_id = current_user.id, request.peer_student_id
        tutor_score, learner_score = my_perf.score, peer_perf.score
    else:
        tutor_id, learner_id = request.peer_student_id, current_user.id
        tutor_score, learner_score = peer_perf.score, my_perf.score
    
    # Calculate compatibility
    compatibility = matching_service.matcher.calculate_compatibility_score(
        tutor_score, learner_score
    )
    
    # Create match
    match = PeerMatch(
        tutor_id=tutor_id,
        learner_id=learner_id,
        chapter=request.chapter,
        subject=request.subject,
        tutor_score=tutor_score,
        learner_score=learner_score,
        compatibility_score=compatibility,
        status=MatchStatus.PENDING,
    )
    
    db.add(match)
    db.commit()
    db.refresh(match)
    
    return {
        "message": "Connection request sent",
        "match_id": match.id,
        "compatibility_score": compatibility,
        "you_are": "tutor" if tutor_id == current_user.id else "learner"
    }
