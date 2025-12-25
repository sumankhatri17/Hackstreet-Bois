# Peer-to-Peer Matching System

## Overview

The peer-to-peer matching system connects high-performing students (tutors) with students who need help (learners) based on their chapter-specific performance. The system uses the **Asymmetric Gale-Shapley algorithm** to create optimal matches.

## How It Works

### 1. Performance Tracking

After a student completes an assessment and receives evaluation:
- Chapter-specific scores are extracted from the evaluation JSON
- Performance data is stored in the `student_chapter_performance` table
- Each student has a score (0-10) for each chapter they've been assessed on

### 2. Matching Algorithm: Asymmetric Gale-Shapley

The system uses a modified Gale-Shapley algorithm where:

#### **Participants**
- **Tutors (Proposers)**: Students with score ≥ 7.0/10 in a chapter
- **Learners (Receivers)**: Students with score ≤ 5.0/10 in a chapter

#### **Compatibility Score Calculation**

The algorithm calculates a compatibility score (0-100) based on:

1. **Score Gap (50% weight)**:
   - Optimal gap: 3-5 points
   - Too small (<2): Not much to teach
   - Too large (>5): Difficulty mismatch
   
2. **Tutor Expertise (30% weight)**:
   - Higher tutor scores = better matches
   
3. **Learner Need (20% weight)**:
   - Lower learner scores = higher priority

#### **Algorithm Process**

```
1. Build preference lists for all tutors and learners based on compatibility
2. Each tutor proposes to their most preferred available learner
3. Learners tentatively accept/reject based on:
   - Current capacity (max 2 tutors per learner)
   - Comparison with existing matches
4. Rejected tutors propose to next preference
5. Process continues until no more proposals possible
6. Result: Stable matching where no pair prefers each other over current matches
```

#### **Capacity Limits**
- Each tutor can help up to **3 learners**
- Each learner can learn from up to **2 tutors**

## Database Models

### StudentChapterPerformance
Stores chapter-specific performance metrics:
```python
- student_id: FK to users
- subject: e.g., "maths", "science"
- chapter: e.g., "Real Numbers", "Chemical Reactions"
- score: 0-10 (from chapter_score_out_of_10)
- accuracy_percentage: 0-100
- weakness_level: "none", "mild", "moderate", "severe"
- total_questions_attempted, correct_answers
- is_strong_chapter, is_weak_chapter
```

### PeerMatch
Represents a tutor-learner pairing:
```python
- tutor_id, learner_id: FK to users
- chapter, subject: What they're matched for
- tutor_score, learner_score: Their respective scores
- compatibility_score: Algorithm-calculated (0-100)
- preference_rank_tutor, preference_rank_learner: Their preference rankings
- status: pending, accepted, rejected, completed
- matched_at, accepted_at, completed_at: Timestamps
```

### TutoringSession
Tracks individual tutoring sessions:
```python
- match_id: FK to peer_matches
- scheduled_at, started_at, ended_at, duration_minutes
- topics_covered: JSON array
- notes: Session notes
- tutor_rating, learner_rating: 1-5 stars
- tutor_feedback, learner_feedback: Text feedback
- learner_progress: Improvement score
```

## API Endpoints

### POST `/api/matching/update-performance/{user_id}`
Update student chapter performance from evaluation files.
- **Auth**: Student themselves, teacher, or admin
- **When to call**: After assessment evaluation completes
- **Response**: Success message

### POST `/api/matching/create-matches`
Create matches for a specific chapter using Gale-Shapley.
```json
{
  "subject": "maths",
  "chapter": "Real Numbers",
  "school_id": 1  // optional
}
```
- **Auth**: Teacher or admin only
- **Response**: List of created matches with details

### GET `/api/matching/my-matches`
Get all matches for the current student.
- **Auth**: Any authenticated student
- **Response**: 
```json
{
  "tutoring_matches": [...],  // Where student is tutor
  "learning_matches": [...],  // Where student is learner
  "total_matches": 5
}
```

### PATCH `/api/matching/match/{match_id}/status`
Update match status (accept, reject, complete).
```json
{
  "status": "accepted"  // or "rejected", "completed"
}
```
- **Auth**: Students in the match, or teacher/admin

### GET `/api/matching/available-chapters`
Get chapters available for matching, grouped by subject.
- **Query params**: `subject` (optional)
- **Response**: List of subjects with their chapters

### GET `/api/matching/stats`
Get statistics about potential tutors and learners.
- **Query params**: `subject`, `chapter` (optional)
- **Response**: 
```json
{
  "total_potential_tutors": 15,
  "total_potential_learners": 23,
  "chapters_available": [...],
  "subjects_available": [...]
}
```

### GET `/api/matching/student/{student_id}/performance`
Get chapter performance for a specific student.
- **Query params**: `subject` (optional)
- **Auth**: Student themselves, or teacher/admin

## Frontend Components

### Student View: `PeerMatchingPage.jsx`
Located at: `/frontend/src/pages/student/PeerMatchingPage.jsx`

**Features**:
- View all matches (tutoring and learning)
- Accept/reject pending matches
- Mark matches as completed
- See match compatibility scores
- View chapter and subject details
- Separate tabs for "Learning From" and "Teaching"

**UI Elements**:
- Stats cards (total matches, teaching count, learning count)
- Match cards with:
  - Peer name, email, school
  - Compatibility score (color-coded)
  - Both scores (tutor and learner)
  - Subject and chapter
  - Status badge
  - Action buttons (accept/reject/complete)

### Teacher/Admin View: `CreateMatchesPage.jsx`
Located at: `/frontend/src/pages/teacher/CreateMatchesPage.jsx`

**Features**:
- Select subject and chapter
- View statistics (potential tutors/learners)
- Create matches with one click
- See recently created matches
- Real-time compatibility scores

**Workflow**:
1. Select subject from dropdown
2. Select chapter from dropdown
3. View stats (how many tutors/learners available)
4. Click "Create Matches"
5. See list of created matches with details

## Frontend Service

### `matching.service.js`
Located at: `/frontend/src/services/matching.service.js`

Provides all API interactions:
```javascript
matchingService.updateStudentPerformance(userId)
matchingService.createMatches({ subject, chapter, school_id })
matchingService.getMyMatches()
matchingService.updateMatchStatus(matchId, status)
matchingService.getAvailableChapters(subject)
matchingService.getMatchingStats(subject, chapter)
matchingService.getStudentPerformance(studentId, subject)
```

## Workflow Example

### For Students:

1. **Complete Assessment** → System evaluates → Scores stored
2. **Navigate to Peer Matching page**
3. **View Matches**:
   - "Learning From Others" tab: See tutors matched to help you
   - "Teaching Others" tab: See students you can help
4. **Accept/Reject** matches based on preference
5. **Mark as Completed** when tutoring session is done

### For Teachers:

1. **Navigate to Create Matches page**
2. **Select subject** (e.g., "science")
3. **Select chapter** (e.g., "Chemical Reactions")
4. **View statistics**: How many potential tutors and learners
5. **Click "Create Matches"**
6. **Review created matches**: See optimal pairings with compatibility scores

## Automatic Performance Updates

After assessment evaluation, call:
```javascript
await matchingService.updateStudentPerformance(userId);
```

This should be integrated into the assessment evaluation workflow:
1. Student submits assessment
2. System evaluates using Mistral AI
3. Evaluation results saved
4. **Automatically update performance data** ← Add this step
5. Student can now be matched

## Integration Points

### 1. After Assessment Evaluation
In your RAG assessment evaluation flow, add:
```python
# After evaluation is complete
from app.services.matching_service import get_peer_matching_service

matching_service = get_peer_matching_service(db)
matching_service.update_student_chapter_performances(user_id)
```

### 2. Frontend Routes
Add to your React Router:
```javascript
// Student routes
<Route path="/student/peer-matching" element={<PeerMatchingPage />} />

// Teacher routes
<Route path="/teacher/create-matches" element={<CreateMatchesPage />} />
```

### 3. Navigation Links
Add to student navigation:
```javascript
<Link to="/student/peer-matching">
  Peer Learning
</Link>
```

Add to teacher navigation:
```javascript
<Link to="/teacher/create-matches">
  Create Matches
</Link>
```

## Database Migration

Run the migration to create tables:
```bash
# If using Alembic
alembic upgrade head

# Or if using direct migration
python backend/migrations/add_peer_matching.py
```

## Algorithm Tunability

The matching algorithm can be tuned via parameters in `AsymmetricGaleShapleyMatcher`:

```python
matcher = AsymmetricGaleShapleyMatcher(
    tutor_threshold=7.0,        # Min score to be tutor (0-10)
    learner_threshold=5.0,      # Max score to need help (0-10)
    max_matches_per_tutor=3,    # How many learners per tutor
    max_matches_per_learner=2,  # How many tutors per learner
)
```

Adjust these based on:
- Student population size
- Performance distribution
- Desired match density

## Benefits of Asymmetric Gale-Shapley

1. **Stability**: No two students prefer each other over their current matches
2. **Optimality**: Best possible matches given preferences
3. **Fairness**: Algorithm is tutor-optimal (tutors get best available matches)
4. **Capacity Handling**: Supports multiple matches per student
5. **Proven**: Well-studied algorithm with guaranteed termination

## Future Enhancements

- **Session Scheduling**: Integrate calendar for scheduling tutoring sessions
- **Progress Tracking**: Track learner improvement over time
- **Feedback System**: Collect and display ratings
- **Automated Re-matching**: Re-run matching after new assessments
- **Notifications**: Email/push notifications for new matches
- **Video Integration**: Built-in video conferencing for remote tutoring
- **Match History**: Track all past matches and outcomes

## Testing

### Test the API:
```bash
# Update performance
curl -X POST http://localhost:8000/api/matching/update-performance/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create matches
curl -X POST http://localhost:8000/api/matching/create-matches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject": "maths", "chapter": "Real Numbers"}'

# Get my matches
curl -X GET http://localhost:8000/api/matching/my-matches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

**Issue**: No matches created
- **Check**: Are there enough students with scores above and below thresholds?
- **Solution**: Lower `tutor_threshold` or raise `learner_threshold`

**Issue**: Performance data not updating
- **Check**: Are evaluation files in the correct location?
- **Solution**: Verify `assessments/{user_id}/` directory structure

**Issue**: Frontend not showing matches
- **Check**: API endpoint returning data?
- **Solution**: Check browser console for errors, verify API connection

## Summary

This peer-to-peer matching system provides an intelligent, algorithm-driven approach to connecting students for collaborative learning. By using the Asymmetric Gale-Shapley algorithm, it ensures optimal, stable matches that benefit both tutors and learners.
