"""
Peer-to-peer matching service using Asymmetric Gale-Shapley algorithm

This service matches high-scoring students (tutors) with low-scoring students (learners)
based on chapter-specific performance data.
"""
import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Set
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.matching import PeerMatch, StudentChapterPerformance, MatchStatus


class AsymmetricGaleShapleyMatcher:
    """
    Implements Asymmetric Gale-Shapley algorithm for peer-to-peer matching.
    
    In this context:
    - Tutors (high-scoring students) are the "proposers"
    - Learners (low-scoring students) are the "receivers"
    - Each tutor has preferences over learners based on compatibility
    - Each learner has preferences over tutors based on their expertise
    """
    
    def __init__(
        self,
        tutor_threshold: float = 7.0,  # Minimum score to be a tutor (out of 10)
        learner_threshold: float = 5.0,  # Maximum score to need help (out of 10)
        max_matches_per_tutor: int = 3,  # Max learners a tutor can help
        max_matches_per_learner: int = 2,  # Max tutors a learner can have
    ):
        self.tutor_threshold = tutor_threshold
        self.learner_threshold = learner_threshold
        self.max_matches_per_tutor = max_matches_per_tutor
        self.max_matches_per_learner = max_matches_per_learner
    
    def calculate_compatibility_score(
        self,
        tutor_score: float,
        learner_score: float,
        tutor_consistency: float = 1.0,
        learner_need: float = 1.0,
        tutor_grade: int = None,
        learner_grade: int = None,
        same_locality: bool = False,
    ) -> float:
        """
        Calculate compatibility score between a tutor and learner.
        
        Factors:
        - Score gap: Larger gap = better teaching opportunity
        - Tutor expertise: Higher tutor score = better match
        - Learner need: Lower learner score = higher need
        - Grade level: Tutor must be same grade or higher
        - Location: Same locality bonus for physical meetings
        - Not too large gap: Prevent mismatched difficulty levels
        
        Returns score between 0-100
        """
        # Grade level filter - tutor must be same or higher grade
        if tutor_grade and learner_grade and tutor_grade < learner_grade:
            return 0.0  # Cannot tutor someone in a higher grade
        
        # Score difference (optimal gap is 3-5 points)
        score_gap = tutor_score - learner_score
        
        # Penalize very small gaps (not much to teach) or very large gaps (too different)
        if score_gap < 2.0:
            gap_score = score_gap * 10  # 0-20 points
        elif score_gap <= 5.0:
            gap_score = 20 + (score_gap - 2.0) * 20  # 20-80 points (optimal)
        else:
            gap_score = max(0, 80 - (score_gap - 5.0) * 10)  # Decrease after 5 points
        
        # Tutor expertise (25% weight)
        expertise_score = (tutor_score / 10.0) * 25
        
        # Learner need (15% weight)
        need_score = ((10.0 - learner_score) / 10.0) * 15
        
        # Location proximity bonus (10% weight)
        location_bonus = 10 if same_locality else 0
        
        # Combined score
        compatibility = (gap_score * 0.5) + expertise_score + need_score + location_bonus
        
        return min(100.0, max(0.0, compatibility))
    
    def build_preference_lists(
        self,
        tutors: Dict[int, Dict],
        learners: Dict[int, Dict],
        chapter: str,
    ) -> Tuple[Dict[int, List[Tuple[int, float]]], Dict[int, List[Tuple[int, float]]]]:
        """
        Build preference lists for tutors and learners.
        
        Returns:
            - tutor_preferences: {tutor_id: [(learner_id, compatibility_score), ...]}
            - learner_preferences: {learner_id: [(tutor_id, compatibility_score), ...]}
        """
        tutor_preferences = {}
        learner_preferences = defaultdict(list)
        
        # Build tutor preferences
        for tutor_id, tutor_data in tutors.items():
            preferences = []
            
            for learner_id, learner_data in learners.items():
                # Don't match same student
                if tutor_id == learner_id:
                    continue
                
                # Check if same locality
                same_locality = (
                    tutor_data.get('locality') and 
                    learner_data.get('locality') and
                    tutor_data['locality'].lower() == learner_data['locality'].lower()
                )
                
                compatibility = self.calculate_compatibility_score(
                    tutor_data['score'],
                    learner_data['score'],
                    tutor_grade=tutor_data.get('grade'),
                    learner_grade=learner_data.get('grade'),
                    same_locality=same_locality,
                )
                
                # Only include if compatibility > 0 (grade filter may exclude)
                if compatibility > 0:
                    preferences.append((learner_id, compatibility))
            
            # Sort by compatibility (descending)
            preferences.sort(key=lambda x: x[1], reverse=True)
            tutor_preferences[tutor_id] = preferences
            
            # Build learner preferences (symmetric)
            for learner_id, compatibility in preferences:
                learner_preferences[learner_id].append((tutor_id, compatibility))
        
        # Sort learner preferences by compatibility (descending)
        for learner_id in learner_preferences:
            learner_preferences[learner_id].sort(key=lambda x: x[1], reverse=True)
        
        return tutor_preferences, dict(learner_preferences)
    
    def gale_shapley_matching(
        self,
        tutor_preferences: Dict[int, List[Tuple[int, float]]],
        learner_preferences: Dict[int, List[Tuple[int, float]]],
    ) -> List[Tuple[int, int, float, int, int]]:
        """
        Run Asymmetric Gale-Shapley algorithm.
        
        Returns:
            List of matches: [(tutor_id, learner_id, compatibility, tutor_rank, learner_rank), ...]
        """
        # Current matches: learner_id -> list of (tutor_id, compatibility)
        learner_matches: Dict[int, List[Tuple[int, float]]] = defaultdict(list)
        
        # Next proposal index for each tutor
        tutor_proposal_index: Dict[int, int] = {tid: 0 for tid in tutor_preferences}
        
        # Free tutors (still have capacity)
        free_tutors: Set[int] = set(tutor_preferences.keys())
        
        # Track number of matches per tutor
        tutor_match_count: Dict[int, int] = defaultdict(int)
        
        while free_tutors:
            # Pick a free tutor
            tutor_id = free_tutors.pop()
            
            # Check if tutor reached max capacity
            if tutor_match_count[tutor_id] >= self.max_matches_per_tutor:
                continue
            
            # Check if tutor has more proposals to make
            if tutor_proposal_index[tutor_id] >= len(tutor_preferences[tutor_id]):
                continue
            
            # Get next preferred learner
            learner_id, compatibility = tutor_preferences[tutor_id][tutor_proposal_index[tutor_id]]
            tutor_proposal_index[tutor_id] += 1
            
            # Learner considers the proposal
            current_matches = learner_matches[learner_id]
            
            if len(current_matches) < self.max_matches_per_learner:
                # Learner has capacity, accept
                learner_matches[learner_id].append((tutor_id, compatibility))
                tutor_match_count[tutor_id] += 1
                
                # Tutor still free if not at capacity
                if tutor_match_count[tutor_id] < self.max_matches_per_tutor:
                    free_tutors.add(tutor_id)
            else:
                # Learner at capacity, check if this tutor is better than worst current match
                worst_match = min(current_matches, key=lambda x: x[1])
                
                if compatibility > worst_match[1]:
                    # Replace worst match with new proposal
                    learner_matches[learner_id].remove(worst_match)
                    learner_matches[learner_id].append((tutor_id, compatibility))
                    
                    # Free the rejected tutor
                    rejected_tutor_id = worst_match[0]
                    tutor_match_count[rejected_tutor_id] -= 1
                    free_tutors.add(rejected_tutor_id)
                    
                    tutor_match_count[tutor_id] += 1
                    
                    # Tutor still free if not at capacity
                    if tutor_match_count[tutor_id] < self.max_matches_per_tutor:
                        free_tutors.add(tutor_id)
                else:
                    # Proposal rejected, tutor remains free
                    free_tutors.add(tutor_id)
        
        # Convert to final match format with ranks
        final_matches = []
        for learner_id, matches in learner_matches.items():
            for tutor_id, compatibility in matches:
                # Find ranks
                tutor_rank = next(
                    (i for i, (lid, _) in enumerate(tutor_preferences[tutor_id]) if lid == learner_id),
                    -1
                )
                learner_rank = next(
                    (i for i, (tid, _) in enumerate(learner_preferences.get(learner_id, [])) if tid == tutor_id),
                    -1
                )
                
                final_matches.append((tutor_id, learner_id, compatibility, tutor_rank, learner_rank))
        
        return final_matches


class PeerMatchingService:
    """Service for managing peer-to-peer student matching"""
    
    def __init__(self, db: Session):
        self.db = db
        self.matcher = AsymmetricGaleShapleyMatcher()
    
    def extract_chapter_performance_from_evaluations(self, user_id: int) -> Dict[str, Dict]:
        """
        Extract chapter-specific performance from assessment evaluation files.
        
        Returns:
            {
                'subject': {
                    'chapter_name': {
                        'score': float,
                        'accuracy_percentage': int,
                        'weakness_level': str,
                        ...
                    }
                }
            }
        """
        assessments_dir = Path("assessments") / str(user_id)
        
        if not assessments_dir.exists():
            return {}
        
        performance_data = defaultdict(dict)
        
        # Find all evaluation files
        for eval_file in assessments_dir.glob("*_evaluation.json"):
            try:
                with open(eval_file, 'r', encoding='utf-8') as f:
                    evaluation = json.load(f)
                
                # Load corresponding assessment to get subject
                assessment_file = eval_file.parent / f"{eval_file.stem.replace('_evaluation', '')}.json"
                if not assessment_file.exists():
                    continue
                
                with open(assessment_file, 'r', encoding='utf-8') as f:
                    assessment = json.load(f)
                
                subject = assessment.get('subject', 'unknown')
                chapter_analysis = evaluation.get('chapter_analysis', {})
                
                # Store each chapter's performance
                for chapter_name, chapter_data in chapter_analysis.items():
                    # Use the most recent or best performance
                    if chapter_name not in performance_data[subject] or \
                       chapter_data['chapter_score_out_of_10'] > performance_data[subject][chapter_name].get('score', 0):
                        performance_data[subject][chapter_name] = {
                            'score': chapter_data['chapter_score_out_of_10'],
                            'accuracy_percentage': chapter_data['accuracy_percentage'],
                            'weakness_level': chapter_data['weakness_level'],
                            'total_questions': chapter_data['total_questions'],
                            'correct': chapter_data['correct'],
                        }
            
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error processing {eval_file}: {e}")
                continue
        
        return dict(performance_data)
    
    def update_student_chapter_performances(self, user_id: int):
        """
        Update or create StudentChapterPerformance records from evaluation data.
        """
        performance_data = self.extract_chapter_performance_from_evaluations(user_id)
        
        for subject, chapters in performance_data.items():
            for chapter, data in chapters.items():
                # Check if record exists
                existing = self.db.query(StudentChapterPerformance).filter(
                    StudentChapterPerformance.student_id == user_id,
                    StudentChapterPerformance.subject == subject,
                    StudentChapterPerformance.chapter == chapter,
                ).first()
                
                if existing:
                    # Update existing
                    existing.score = data['score']
                    existing.accuracy_percentage = data['accuracy_percentage']
                    existing.weakness_level = data['weakness_level']
                    existing.total_questions_attempted = data['total_questions']
                    existing.correct_answers = data['correct']
                else:
                    # Create new
                    performance = StudentChapterPerformance(
                        student_id=user_id,
                        subject=subject,
                        chapter=chapter,
                        score=data['score'],
                        accuracy_percentage=data['accuracy_percentage'],
                        weakness_level=data['weakness_level'],
                        total_questions_attempted=data['total_questions'],
                        correct_answers=data['correct'],
                    )
                    self.db.add(performance)
        
        self.db.commit()
    
    def find_matches_for_chapter(
        self,
        subject: str,
        chapter: str,
        school_id: Optional[int] = None,
    ) -> List[Tuple[int, int, float, int, int]]:
        """
        Find peer matches for a specific chapter using Gale-Shapley algorithm.
        
        Returns:
            List of matches: [(tutor_id, learner_id, compatibility, tutor_rank, learner_rank), ...]
        """
        # Get all students with performance data for this chapter
        query = self.db.query(StudentChapterPerformance).filter(
            StudentChapterPerformance.subject == subject,
            StudentChapterPerformance.chapter == chapter,
        )
        
        if school_id:
            query = query.join(User).filter(User.school_id == school_id)
        
        performances = query.all()
        
        # Separate into tutors and learners
        tutors = {}
        learners = {}
        
        for perf in performances:
            user = self.db.query(User).filter(User.id == perf.student_id).first()
            if not user:
                continue
            
            user_data = {
                'score': perf.score,
                'accuracy': perf.accuracy_percentage,
                'grade': user.current_level,
                'locality': user.locality or user.city,
            }
            
            if perf.score >= self.matcher.tutor_threshold:
                tutors[perf.student_id] = user_data
            
            if perf.score <= self.matcher.learner_threshold:
                learners[perf.student_id] = user_data
        
        # Need both tutors and learners
        if not tutors or not learners:
            return []
        
        # Build preference lists
        tutor_prefs, learner_prefs = self.matcher.build_preference_lists(
            tutors, learners, chapter
        )
        
        # Run Gale-Shapley
        matches = self.matcher.gale_shapley_matching(tutor_prefs, learner_prefs)
        
        return matches
    
    def create_matches(
        self,
        subject: str,
        chapter: str,
        school_id: Optional[int] = None,
    ) -> List[PeerMatch]:
        """
        Create and save peer matches for a specific chapter.
        """
        matches = self.find_matches_for_chapter(subject, chapter, school_id)
        
        created_matches = []
        
        for tutor_id, learner_id, compatibility, tutor_rank, learner_rank in matches:
            # Get actual scores
            tutor_perf = self.db.query(StudentChapterPerformance).filter(
                StudentChapterPerformance.student_id == tutor_id,
                StudentChapterPerformance.subject == subject,
                StudentChapterPerformance.chapter == chapter,
            ).first()
            
            learner_perf = self.db.query(StudentChapterPerformance).filter(
                StudentChapterPerformance.student_id == learner_id,
                StudentChapterPerformance.subject == subject,
                StudentChapterPerformance.chapter == chapter,
            ).first()
            
            if not tutor_perf or not learner_perf:
                continue
            
            # Create match
            match = PeerMatch(
                tutor_id=tutor_id,
                learner_id=learner_id,
                chapter=chapter,
                subject=subject,
                tutor_score=tutor_perf.score,
                learner_score=learner_perf.score,
                compatibility_score=compatibility,
                preference_rank_tutor=tutor_rank,
                preference_rank_learner=learner_rank,
                status=MatchStatus.PENDING,
            )
            
            self.db.add(match)
            created_matches.append(match)
        
        self.db.commit()
        
        return created_matches
    
    def get_student_matches(
        self,
        student_id: int,
        role: Optional[str] = None,  # 'tutor', 'learner', or None for both
    ) -> List[PeerMatch]:
        """Get all matches for a student."""
        query = self.db.query(PeerMatch)
        
        if role == 'tutor':
            query = query.filter(PeerMatch.tutor_id == student_id)
        elif role == 'learner':
            query = query.filter(PeerMatch.learner_id == student_id)
        else:
            query = query.filter(
                (PeerMatch.tutor_id == student_id) | (PeerMatch.learner_id == student_id)
            )
        
        return query.all()
    
    def get_potential_tutors_for_student(
        self,
        student_id: int,
        subject: str,
        chapter: str,
        limit: int = 10,
    ) -> List[Tuple[int, float, Dict]]:
        """
        Get potential tutors for a student based on their performance.
        Returns list of (tutor_id, compatibility_score, tutor_data)
        """
        # Get student's performance
        student_perf = self.db.query(StudentChapterPerformance).filter(
            StudentChapterPerformance.student_id == student_id,
            StudentChapterPerformance.subject == subject,
            StudentChapterPerformance.chapter == chapter,
        ).first()
        
        if not student_perf:
            return []
        
        # Find potential tutors (high scorers)
        tutors_query = self.db.query(StudentChapterPerformance).filter(
            StudentChapterPerformance.subject == subject,
            StudentChapterPerformance.chapter == chapter,
            StudentChapterPerformance.score >= self.matcher.tutor_threshold,
            StudentChapterPerformance.student_id != student_id,  # Not themselves
        )
        
        tutors = tutors_query.all()
        
        # Calculate compatibility and build results
        potential_tutors = []
        for tutor_perf in tutors:
            compatibility = self.matcher.calculate_compatibility_score(
                tutor_perf.score,
                student_perf.score,
            )
            
            # Get tutor user data
            tutor_user = self.db.query(User).filter(User.id == tutor_perf.student_id).first()
            
            if tutor_user:
                potential_tutors.append((
                    tutor_perf.student_id,
                    compatibility,
                    {
                        'name': tutor_user.name,
                        'email': tutor_user.email,
                        'score': tutor_perf.score,
                        'accuracy': tutor_perf.accuracy_percentage,
                        'school': tutor_user.school.name if tutor_user.school else None,
                    }
                ))
        
        # Sort by compatibility (descending)
        potential_tutors.sort(key=lambda x: x[1], reverse=True)
        
        return potential_tutors[:limit]
    
    def get_potential_learners_for_student(
        self,
        student_id: int,
        subject: str,
        chapter: str,
        limit: int = 10,
    ) -> List[Tuple[int, float, Dict]]:
        """
        Get potential learners a student can help based on their performance.
        Returns list of (learner_id, compatibility_score, learner_data)
        """
        # Get student's performance
        student_perf = self.db.query(StudentChapterPerformance).filter(
            StudentChapterPerformance.student_id == student_id,
            StudentChapterPerformance.subject == subject,
            StudentChapterPerformance.chapter == chapter,
        ).first()
        
        if not student_perf or student_perf.score < self.matcher.tutor_threshold:
            return []  # Student not qualified to tutor
        
        # Find potential learners (low scorers)
        learners_query = self.db.query(StudentChapterPerformance).filter(
            StudentChapterPerformance.subject == subject,
            StudentChapterPerformance.chapter == chapter,
            StudentChapterPerformance.score <= self.matcher.learner_threshold,
            StudentChapterPerformance.student_id != student_id,  # Not themselves
        )
        
        learners = learners_query.all()
        
        # Calculate compatibility and build results
        potential_learners = []
        for learner_perf in learners:
            compatibility = self.matcher.calculate_compatibility_score(
                student_perf.score,
                learner_perf.score,
            )
            
            # Get learner user data
            learner_user = self.db.query(User).filter(User.id == learner_perf.student_id).first()
            
            if learner_user:
                potential_learners.append((
                    learner_perf.student_id,
                    compatibility,
                    {
                        'name': learner_user.name,
                        'email': learner_user.email,
                        'score': learner_perf.score,
                        'accuracy': learner_perf.accuracy_percentage,
                        'school': learner_user.school.name if learner_user.school else None,
                    }
                ))
        
        # Sort by compatibility (descending)
        potential_learners.sort(key=lambda x: x[1], reverse=True)
        
        return potential_learners[:limit]


def get_peer_matching_service(db: Session) -> PeerMatchingService:
    """Get peer matching service instance."""
    return PeerMatchingService(db)
