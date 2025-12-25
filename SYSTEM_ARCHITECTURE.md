# System Architecture Diagram

## Complete Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STUDENT JOURNEY                              │
└─────────────────────────────────────────────────────────────────────┘

1. ASSESSMENT PHASE
   ┌──────────────┐
   │   Student    │
   │  Takes Test  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────┐
   │  RAG Service     │
   │  Generates Qs    │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ Student Submits  │
   │    Answers       │
   └──────┬───────────┘
          │
          ▼

2. EVALUATION PHASE
   ┌──────────────────────────┐
   │   Evaluation Service     │
   │   (Mistral AI)          │
   │                          │
   │  ┌────────────────────┐ │
   │  │ chapter_analysis:  │ │
   │  │  - Real Numbers    │ │
   │  │    score: 9/10     │ │
   │  │  - Polynomials     │ │
   │  │    score: 4/10     │ │
   │  └────────────────────┘ │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │  Save to JSON Files      │
   │  assessments/1/          │
   │    ├── {id}.json         │
   │    └── {id}_eval.json    │
   └──────────┬───────────────┘
              │
              ▼

3. AUTOMATIC PERFORMANCE UPDATE (NEW!)
   ┌──────────────────────────┐
   │  Matching Service        │
   │  .update_performance()   │
   │                          │
   │  Extracts chapter data:  │
   │  ┌────────────────────┐ │
   │  │ Real Numbers: 9    │ │ → student_chapter_performance
   │  │ Polynomials: 4     │ │
   │  │ Equations: 7       │ │
   │  └────────────────────┘ │
   └──────────┬───────────────┘
              │
              ▼

4. MATCHING PHASE
   ┌──────────────────────────┐
   │  Teacher Action          │
   │  "Create Matches"        │
   └──────────┬───────────────┘
              │
              ▼
   ┌─────────────────────────────────────────┐
   │  Asymmetric Gale-Shapley Algorithm      │
   │                                          │
   │  1. Find Tutors (score ≥ 7)             │
   │     Alice: 9, Bob: 8, Charlie: 7        │
   │                                          │
   │  2. Find Learners (score ≤ 5)           │
   │     David: 3, Emma: 4, Frank: 5         │
   │                                          │
   │  3. Calculate Compatibility             │
   │     ┌─────────────────────────┐        │
   │     │      D    E    F         │        │
   │     │ A   95   88   85        │        │
   │     │ B   88   82   80        │        │
   │     │ C   78   75   72        │        │
   │     └─────────────────────────┘        │
   │                                          │
   │  4. Run Algorithm                       │
   │     Round 1: A→D, B→E, C→F              │
   │     All accept                          │
   │                                          │
   │  5. Create Matches                      │
   │     ✓ Alice ↔ David (95%)              │
   │     ✓ Bob ↔ Emma (82%)                 │
   │     ✓ Charlie ↔ Frank (72%)            │
   └──────────────────────────────────────────┘
              │
              ▼

5. STUDENT INTERACTION
   ┌────────────────────────┐     ┌────────────────────────┐
   │  Tutor View            │     │  Learner View          │
   │  (Alice)               │     │  (David)               │
   │                        │     │                        │
   │  Teaching:             │     │  Learning From:        │
   │  ├─ David (95%)        │     │  ├─ Alice (95%)        │
   │  │   Real Numbers      │◄───►│  │   Real Numbers      │
   │  │   [Accept/Reject]   │     │  │   [Accept/Reject]   │
   │  └─ ...                │     │  └─ ...                │
   └────────────────────────┘     └────────────────────────┘
              │                                 │
              └─────────────┬───────────────────┘
                            │
                            ▼
   ┌────────────────────────────────────┐
   │  Match Status: Accepted            │
   │  Start Tutoring Session            │
   │                                    │
   │  After session:                    │
   │  - Rate experience                 │
   │  - Provide feedback                │
   │  - Mark as completed               │
   └────────────────────────────────────┘
```

## Database Schema

```
┌────────────────────────┐
│        users           │
├────────────────────────┤
│ id (PK)                │
│ name                   │
│ email                  │
│ role                   │
│ math_level             │
│ science_level          │
│ fit_to_teach_level     │
└────────┬───────────────┘
         │
         │ 1:N
         ▼
┌────────────────────────────────┐
│ student_chapter_performance    │
├────────────────────────────────┤
│ id (PK)                        │
│ student_id (FK → users)        │
│ subject                        │
│ chapter                        │
│ score (0-10)                   │
│ accuracy_percentage            │
│ weakness_level                 │
│ is_strong_chapter              │
│ is_weak_chapter                │
└────────┬───────────────────────┘
         │
         │ Used by matching algorithm
         ▼
┌────────────────────────────────┐
│       peer_matches             │
├────────────────────────────────┤
│ id (PK)                        │
│ tutor_id (FK → users)          │
│ learner_id (FK → users)        │
│ chapter                        │
│ subject                        │
│ tutor_score                    │
│ learner_score                  │
│ compatibility_score            │
│ status (pending/accepted/...)  │
│ matched_at                     │
└────────┬───────────────────────┘
         │
         │ 1:N
         ▼
┌────────────────────────────────┐
│     tutoring_sessions          │
├────────────────────────────────┤
│ id (PK)                        │
│ match_id (FK → peer_matches)   │
│ scheduled_at                   │
│ started_at                     │
│ ended_at                       │
│ duration_minutes               │
│ tutor_rating                   │
│ learner_rating                 │
│ tutor_feedback                 │
│ learner_feedback               │
│ learner_progress               │
└────────────────────────────────┘
```

## API Flow

```
Frontend                    Backend                     Database
────────                    ───────                     ────────

1. ASSESSMENT COMPLETION
   POST /rag/submit-assessment
   ─────────────────────────►
                              Save JSON file
                              ─────────────────────────►
                              
   POST /rag/evaluate-assessment
   ─────────────────────────►
                              Call Mistral AI
                              Save evaluation JSON
                              Update user levels
                              ─────────────────────────►
                              
                              Auto: update_performance()
                              ─────────────────────────►
                                                         INSERT INTO
                                                         student_chapter_performance
   ◄─────────────────────────
   Evaluation complete

2. CREATE MATCHES (Teacher)
   GET /matching/stats
   ─────────────────────────►
                              Query performance data
                              ─────────────────────────►
                                                         SELECT tutors/learners
   ◄─────────────────────────
   Stats: 15 tutors, 23 learners

   POST /matching/create-matches
   { subject, chapter }
   ─────────────────────────►
                              Run Gale-Shapley
                              Calculate compatibility
                              ─────────────────────────►
                                                         INSERT INTO peer_matches
   ◄─────────────────────────
   Matches created: [...]

3. VIEW MATCHES (Student)
   GET /matching/my-matches
   ─────────────────────────►
                              Query user's matches
                              ─────────────────────────►
                                                         SELECT * FROM peer_matches
                                                         WHERE tutor_id = X
                                                         OR learner_id = X
   ◄─────────────────────────
   {
     tutoring_matches: [...],
     learning_matches: [...]
   }

4. UPDATE MATCH STATUS
   PATCH /match/{id}/status
   { status: "accepted" }
   ─────────────────────────►
                              Verify authorization
                              ─────────────────────────►
                                                         UPDATE peer_matches
                                                         SET status = 'accepted'
   ◄─────────────────────────
   Status updated
```

## Component Architecture

```
Frontend Structure
──────────────────

src/
├── pages/
│   ├── student/
│   │   └── PeerMatchingPage.jsx
│   │       ├── State Management
│   │       │   ├── matches (tutoring/learning)
│   │       │   ├── loading
│   │       │   └── error
│   │       ├── Components
│   │       │   ├── Stats Cards
│   │       │   ├── Tabs (Learning/Teaching)
│   │       │   └── Match Cards
│   │       └── Actions
│   │           ├── Accept Match
│   │           ├── Reject Match
│   │           └── Complete Match
│   │
│   └── teacher/
│       └── CreateMatchesPage.jsx
│           ├── State Management
│           │   ├── availableChapters
│           │   ├── stats
│           │   ├── selectedSubject
│           │   ├── selectedChapter
│           │   └── createdMatches
│           ├── Components
│           │   ├── Selection Form
│           │   ├── Statistics Card
│           │   └── Matches List
│           └── Actions
│               └── Create Matches
│
└── services/
    └── matching.service.js
        ├── updateStudentPerformance()
        ├── createMatches()
        ├── getMyMatches()
        ├── updateMatchStatus()
        ├── getAvailableChapters()
        ├── getMatchingStats()
        └── getStudentPerformance()


Backend Structure
─────────────────

app/
├── models/
│   └── matching.py
│       ├── StudentChapterPerformance
│       ├── PeerMatch
│       └── TutoringSession
│
├── services/
│   └── matching_service.py
│       ├── AsymmetricGaleShapleyMatcher
│       │   ├── calculate_compatibility_score()
│       │   ├── build_preference_lists()
│       │   └── gale_shapley_matching()
│       └── PeerMatchingService
│           ├── extract_chapter_performance()
│           ├── update_student_chapter_performances()
│           ├── find_matches_for_chapter()
│           ├── create_matches()
│           └── get_student_matches()
│
├── schemas/
│   └── matching.py
│       ├── StudentChapterPerformance
│       ├── PeerMatch
│       ├── TutoringSession
│       ├── MatchingRequest
│       ├── MatchingResponse
│       └── StudentMatchesResponse
│
└── api/
    └── routes/
        └── matching.py
            ├── POST /update-performance/{user_id}
            ├── POST /create-matches
            ├── GET  /my-matches
            ├── PATCH /match/{id}/status
            ├── GET  /available-chapters
            ├── GET  /stats
            └── GET  /student/{id}/performance
```

## Gale-Shapley Algorithm Visualization

```
Input State:
═══════════

Tutors (≥7/10):          Learners (≤5/10):
┌─────────────┐         ┌─────────────┐
│ Alice   [9] │         │ David   [3] │
│ Bob     [8] │         │ Emma    [4] │
│ Charlie [7] │         │ Frank   [5] │
└─────────────┘         └─────────────┘

Compatibility Matrix:
         David  Emma  Frank
Alice      95    88    85
Bob        88    82    80
Charlie    78    75    72


Algorithm Execution:
══════════════════

Round 1:
┌─────────────┐         ┌─────────────┐
│ Alice   [9] │───95%──►│ David   [3] │ ✓ Accepts
│ Bob     [8] │───82%──►│ Emma    [4] │ ✓ Accepts
│ Charlie [7] │───72%──►│ Frank   [5] │ ✓ Accepts
└─────────────┘         └─────────────┘

Result: All matches stable!


Final Matches:
═════════════

┌──────────────────────────────────────┐
│ Match 1                              │
│ Alice (9) ↔ David (3)                │
│ Compatibility: 95%                   │
│ Status: pending                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Match 2                              │
│ Bob (8) ↔ Emma (4)                   │
│ Compatibility: 82%                   │
│ Status: pending                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Match 3                              │
│ Charlie (7) ↔ Frank (5)              │
│ Compatibility: 72%                   │
│ Status: pending                      │
└──────────────────────────────────────┘
```

## Data Flow Timeline

```
Time: T0 - Student takes assessment
      │
      ├─► Questions generated by RAG service
      ├─► Student submits answers
      ├─► JSON saved: assessments/1/uuid.json
      │
Time: T1 - Evaluation triggered
      │
      ├─► Mistral AI evaluates answers
      ├─► Chapter scores calculated
      ├─► JSON saved: assessments/1/uuid_evaluation.json
      ├─► User levels updated in database
      │
Time: T2 - Performance auto-update (NEW!)
      │
      ├─► Matching service reads evaluation files
      ├─► Extracts chapter-specific scores
      ├─► Inserts/updates student_chapter_performance table
      │
Time: T3 - Teacher creates matches
      │
      ├─► Selects subject and chapter
      ├─► Views statistics
      ├─► Clicks "Create Matches"
      │
Time: T4 - Algorithm runs
      │
      ├─► Query all students with performance in chapter
      ├─► Separate into tutors (≥7) and learners (≤5)
      ├─► Calculate compatibility for all pairs
      ├─► Build preference lists
      ├─► Run Gale-Shapley algorithm
      ├─► Create match records in database
      │
Time: T5 - Students see matches
      │
      ├─► Student logs in
      ├─► Navigates to "Peer Learning"
      ├─► Sees matches (teaching and learning)
      ├─► Accepts/rejects matches
      │
Time: T6 - Tutoring happens
      │
      ├─► Students connect
      ├─► Tutoring session occurs
      ├─► Both rate experience
      ├─► Match marked as completed
      │
Time: T7 - Next assessment
      │
      └─► Cycle repeats, new performance data, new matches possible
```

---

**Key Insight:** The entire system is designed to be automatic and seamless. Once a student completes an assessment, they're automatically eligible for matching with zero manual intervention required!
