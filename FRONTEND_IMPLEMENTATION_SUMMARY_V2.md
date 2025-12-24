# Frontend Implementation Summary for Backend Developer

## Overview

The frontend has been implemented for the EduAssess platform with a focus on **Math and English only** evaluation system with **peer-to-peer learning**.

### 🔄 Major System Change: Everyone is a Student

**No separate teacher/tutor role.** After taking assessments:

- Students get their weaknesses identified (score < 60%)
- Students get their strengths identified (score > 75%)
- Matched with **peer tutors** (other students strong in their weak areas)
- Can **help other peers** in areas where they excel
- A student is both a learner AND a tutor simultaneously

---

## Key Frontend Changes Made

### 1. Registration System (`/frontend/src/pages/auth/Register.jsx`)

**Simplified registration - Everyone is a Student:**

```javascript
const formData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  schoolName: "", // School/institution name (required)
  gradeLevel: "", // Current grade "6" to "12" (required)
};
```

**Registration Fields:**

- `gradeLevel`: Dropdown with options: "6", "7", "8", "9", "10", "11", "12"
- `schoolName`: Text input for school/institution
- Info message: "You'll take assessments in Math and English based on your grade level. Based on your performance, you can help peers in topics where you excel!"

**Expected Backend Request:**

```json
POST /api/auth/register
{
  "email": "student@example.com",
  "name": "John Doe",
  "password": "password123",
  "school_name": "Lincoln High School",
  "grade_level": 8
}
```

**Expected Backend Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "name": "John Doe",
    "grade_level": 8,
    "school_name": "Lincoln High School",
    "has_taken_initial_assessment": false
  }
}
```

---

### 2. Initial Assessment Flow (NEW)

**After registration, student MUST take initial assessment:**

**Frontend behavior:**

- After successful registration/login, check `has_taken_initial_assessment`
- If `false`, redirect to `/assessment/initial`
- Cannot access dashboard until assessment is completed

**Expected API:**

```json
GET /api/assessments/initial?grade=8

Response:
{
  "assessment_id": "init_123",
  "grade": 8,
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "subject": "Mathematics",
      "topic": "Algebra",
      "question": "What is the solution to 2x + 5 = 13?",
      "options": ["x = 2", "x = 4", "x = 6", "x = 8"],
      "difficulty": "medium"
    },
    {
      "id": 2,
      "type": "essay",
      "subject": "English",
      "topic": "Grammar",
      "question": "Explain the difference between 'your' and 'you're' with examples.",
      "difficulty": "easy"
    }
    // ... 20-30 questions covering various Math & English topics
  ]
}
```

**Submit Assessment:**

```json
POST /api/assessments/initial/submit

Request:
{
  "assessment_id": "init_123",
  "answers": [
    { "question_id": 1, "answer": "x = 4" },
    { "question_id": 2, "answer": "Your is possessive... you're is you are..." }
  ]
}

Response:
{
  "overall_results": {
    "math_level": 72,
    "reading_level": 68,
    "tests_completed": 1
  },

  "topic_scores": {
    "Algebra": 45,
    "Geometry": 88,
    "Trigonometry": 75,
    "Grammar": 52,
    "Reading Comprehension": 78,
    "Essay Writing": 70
  },

  "weak_topics": [
    { "topic": "Algebra", "subject": "Mathematics", "score": 45, "grade": 8 },
    { "topic": "Grammar", "subject": "English", "score": 52, "grade": 8 }
  ],

  "strong_topics": [
    { "topic": "Geometry", "subject": "Mathematics", "score": 88, "grade": 8 },
    { "topic": "Reading Comprehension", "subject": "English", "score": 78, "grade": 8 }
  ],

  "peer_tutors": [
    {
      "id": 456,
      "name": "Sarah Johnson",
      "grade": 9,
      "strong_topics": ["Algebra", "Equations"],
      "scores": { "Algebra": 92, "Linear Equations": 88 },
      "can_help_with": ["Algebra"]
    }
  ],

  "peers_you_can_help": [
    {
      "id": 789,
      "name": "Mike Chen",
      "grade": 7,
      "weak_topics": ["Geometry"],
      "their_score": 42,
      "you_can_help_with": "Geometry",
      "your_score": 88
    }
  ],

  "ai_feedback": [
    {
      "question_id": 2,
      "feedback": "Good explanation! You correctly identified the difference...",
      "score": 85
    }
  ]
}
```

---

### 3. Student Dashboard (`/frontend/src/pages/student/StudentDashboardPage.jsx`)

**Expected API Response Structure:**

```json
GET /api/students/me/dashboard

Response:
{
  "personal_info": {
    "name": "John Doe",
    "grade": 8,
    "school_name": "Lincoln High School"
  },

  "stats": {
    "current_grade": 8,
    "math_level": 72,
    "reading_level": 68,
    "tests_completed": 5,
    "help_sessions_given": 3,
    "help_sessions_received": 2
  },

  "recent_activities": [
    {
      "type": "assessment",
      "title": "Math Assessment Completed",
      "date": "2 hours ago",
      "status": "completed"
    },
    {
      "type": "help_session",
      "title": "Helped Mike with Geometry",
      "date": "1 day ago",
      "status": "completed"
    }
  ],

  "upcoming_tests": [
    {
      "subject": "English",
      "date": "Dec 26",
      "description": "Reading comprehension test"
    }
  ],

  "weak_areas": [
    {
      "topic": "Algebra",
      "subject": "Mathematics",
      "score": 45,
      "grade": 8,
      "improvement_since_last": -2
    },
    {
      "topic": "Grammar",
      "subject": "English",
      "score": 52,
      "grade": 8,
      "improvement_since_last": 5
    }
  ],

  "strong_areas": [
    {
      "topic": "Geometry",
      "subject": "Mathematics",
      "score": 88,
      "grade": 8
    },
    {
      "topic": "Reading Comprehension",
      "subject": "English",
      "score": 78,
      "grade": 8
    }
  ],

  "peer_tutors_for_me": [
    {
      "id": 456,
      "name": "Sarah Johnson",
      "grade": 9,
      "can_help_with": ["Algebra", "Linear Equations"],
      "their_scores": { "Algebra": 92, "Linear Equations": 88 },
      "match_reason": "Sarah scored 92% in Algebra (you scored 45%)",
      "availability": "Online now"
    },
    {
      "id": 457,
      "name": "Tom Wilson",
      "grade": 8,
      "can_help_with": ["Grammar"],
      "their_scores": { "Grammar": 85 },
      "match_reason": "Tom scored 85% in Grammar (you scored 52%)",
      "availability": "Last seen 2h ago"
    }
  ],

  "peers_i_can_help": [
    {
      "id": 789,
      "name": "Mike Chen",
      "grade": 7,
      "needs_help_with": ["Geometry"],
      "their_score": 42,
      "your_score": 88,
      "match_reason": "You scored 88% in Geometry, Mike scored 42%",
      "requested_help": true
    },
    {
      "id": 790,
      "name": "Emma Davis",
      "grade": 8,
      "needs_help_with": ["Reading Comprehension"],
      "their_score": 55,
      "your_score": 78,
      "match_reason": "You scored 78% in Reading Comprehension, Emma scored 55%",
      "requested_help": false
    }
  ],

  "study_materials": [
    {
      "id": 101,
      "icon": "🃏",
      "title": "Algebra Basics",
      "topic": "Algebra",
      "type": "Flashcards",
      "subject": "Math",
      "recommended_for": "Your weak area"
    },
    {
      "id": 102,
      "icon": "📹",
      "title": "Grammar Rules",
      "topic": "Grammar",
      "type": "Video",
      "subject": "English",
      "recommended_for": "Your weak area"
    }
  ],

  "teaching_materials": [
    {
      "id": 201,
      "icon": "👨‍🏫",
      "title": "Teaching Geometry Basics",
      "topic": "Geometry",
      "type": "Lesson Plan",
      "difficulty": "Intermediate",
      "description": "Step-by-step guide to explain geometric concepts with visual examples"
    },
    {
      "id": 202,
      "icon": "📋",
      "title": "Reading Comprehension Strategies",
      "topic": "Reading Comprehension",
      "type": "Teaching Guide",
      "difficulty": "Beginner",
      "description": "Techniques to help peers improve their reading skills"
    }
  ]
}
```

**Dashboard UI Shows:**

#### Top Stats (4 cards):

- Current Grade: 8
- Math Level: 72%
- English Level: 68%
- Tests Completed: 5

#### Your Learning Journey Section:

- **Areas You Need Help With** (Weak Topics < 60%):
  - Shows topic, score, subject, grade level
  - Shows peer tutors who can help
  - "Request Help" button for each peer

#### Your Teaching Opportunities Section:

- **Your Strong Areas** (Topics > 75%):
  - Shows topic, your score, subject
  - Number of peers who need help
- **Peers You Can Help**:
  - Shows peer name, grade, topic they need help with
  - Their score vs your score
  - "Offer Help" or "Accept Request" button

#### Study Materials Section:

- Recommended materials for weak areas
- Flashcards, videos, practice sets

#### Teaching Materials Section (NEW):

- **Teaching Resources** for helping peers effectively
- Lesson plans, teaching guides, practice problems
- Only shown if student has strong areas and peers to help
- Types: Lesson Plan, Teaching Guide, Examples, Teaching Tips
- Helps peer tutors prepare before help sessions

#### Recent Activity:

- Assessments completed
- Help sessions given/received
- Progress updates

#### Retake Assessment (NEW):

- **Button in welcome section** - Students can retake their assessment anytime
- Navigate to `/assessment/initial` to update skill levels
- Reassessed by AI model
- Peer matches refresh based on new scores

---

### 4. Assessment Components

#### AnswerInput Component (`/frontend/src/components/assessment/AnswerInput.jsx`)

**Supports 4 question types:**

1. **Multiple Choice** - Radio button selection
2. **True/False** - Two-button choice
3. **Short Answer** - Text input with helper text
4. **Essay/Written** - Large textarea with:
   - Character counter
   - "AI evaluation enabled ✓" indicator
   - Placeholder: "Write your detailed answer here... Our AI will evaluate your response"

**Expected Question Object Structure:**

```javascript
{
  id: 1,
  type: "multiple_choice",  // or "true_false", "short_answer", "essay", "written"
  subject: "Mathematics",   // or "English"
  topic: "Algebra",
  question: "What is 2 + 2?",
  options: ["2", "3", "4", "5"],  // For MCQ only
  difficulty: "medium",     // "easy", "medium", "hard"
  grade: 8
}
```

---

### 5. Flashcards Viewer (`/frontend/src/components/student/FlashcardsViewer.jsx`)

**New component for interactive flashcard study**

**Expected Flashcard Data Structure:**

```javascript
GET /api/materials/flashcards?topic=Algebra&grade=8

Response:
{
  "topic": "Algebra Basics",
  "subject": "Mathematics",
  "grade": 8,
  "total_cards": 15,
  "flashcards": [
    {
      "id": 1,
      "question": "What is the solution to 2x + 5 = 13?",
      "answer": "x = 4",
      "explanation": "Subtract 5 from both sides to get 2x = 8, then divide by 2"
    },
    {
      "id": 2,
      "question": "What is a variable?",
      "answer": "A symbol (usually a letter) that represents an unknown value",
      "explanation": "Variables like x, y, z are used to represent numbers we don't know yet"
    }
  ]
}
```

**Features:**

- Click to flip card (question → answer)
- Navigation buttons (Previous/Next)
- Progress bar
- Shows current card number (e.g., "3 / 15")

---

## Updated User Model Fields (Backend Needs These)

### User Table Columns:

```python
# Basic fields
id = Column(Integer, primary_key=True)
email = Column(String, unique=True, nullable=False)
name = Column(String, nullable=False)
hashed_password = Column(String, nullable=False)
school_name = Column(String, nullable=False)
grade_level = Column(Integer, nullable=False)     # 6-12

# Assessment status
has_taken_initial_assessment = Column(Boolean, default=False)
created_at = Column(DateTime, default=datetime.utcnow)

# Proficiency levels (updated after each assessment)
math_level = Column(Integer, default=0)           # 0-100
reading_level = Column(Integer, default=0)        # 0-100
tests_completed = Column(Integer, default=0)

# Topic-specific scores (JSON column or separate table)
topic_scores = Column(JSON)
# Example: {"Algebra": 45, "Geometry": 88, "Grammar": 52, "Reading": 78}

# Weak and strong topics (comma-separated or JSON)
weak_topics = Column(String)                      # "Algebra,Grammar"
strong_topics = Column(String)                    # "Geometry,Reading Comprehension"

# Peer teaching metrics
help_sessions_given = Column(Integer, default=0)
help_sessions_received = Column(Integer, default=0)
peers_helped = Column(Integer, default=0)         # Unique count
```

### New Tables Needed:

#### 1. PeerMatches Table

```python
id = Column(Integer, primary_key=True)
student_id = Column(Integer, ForeignKey('users.id'))
peer_id = Column(Integer, ForeignKey('users.id'))
match_type = Column(String)  # "tutor_for_me" or "i_can_help"
topic = Column(String)       # "Algebra"
subject = Column(String)     # "Mathematics"
student_score = Column(Integer)
peer_score = Column(Integer)
created_at = Column(DateTime)
```

#### 2. HelpSessions Table

```python
id = Column(Integer, primary_key=True)
helper_id = Column(Integer, ForeignKey('users.id'))
learner_id = Column(Integer, ForeignKey('users.id'))
topic = Column(String)
subject = Column(String)
status = Column(String)      # "requested", "accepted", "completed", "cancelled"
requested_at = Column(DateTime)
completed_at = Column(DateTime)
feedback = Column(Text)
```

---

## Data Flow Examples

### 1. Student Registration Flow:

1. Frontend: User fills form → POST to `/api/auth/register`
2. Backend:
   - Creates user with `grade_level`, `school_name`
   - Sets `has_taken_initial_assessment = false`
   - Returns JWT token + user object
3. Frontend:
   - Stores token
   - Checks `has_taken_initial_assessment`
   - Redirects to `/assessment/initial`

### 2. Initial Assessment Flow:

1. Frontend: GET `/api/assessments/initial?grade=8`
2. Backend: Returns 20-30 mixed Math & English questions
3. Frontend: Student completes → POST `/api/assessments/initial/submit`
4. Backend:
   - AI evaluates all answers (MCQ auto-graded, written AI-evaluated)
   - Calculates overall `math_level` and `reading_level`
   - Calculates topic-specific scores: `{"Algebra": 45, "Geometry": 88, ...}`
   - Identifies **weak topics** (score < 60%): `"Algebra,Grammar"`
   - Identifies **strong topics** (score > 75%): `"Geometry,Reading"`
   - Runs peer matching algorithm:
     - Find peers strong (>75%) in student's weak topics → peer tutors
     - Find peers weak (<60%) in student's strong topics → peers to help
   - Updates user: `has_taken_initial_assessment = true`
   - Returns complete evaluation with matches
5. Frontend: Shows results dashboard with all recommendations

### 3. Peer Matching Algorithm (Backend Logic):

```python
def match_peers(student_id):
    student = get_student(student_id)
    weak_topics = student.weak_topics.split(',')
    strong_topics = student.strong_topics.split(',')

    peer_tutors = []
    peers_to_help = []

    # Find peer tutors for this student's weak areas
    for weak_topic in weak_topics:
        student_score = student.topic_scores[weak_topic]

        # Find students who scored > 75% in this topic
        # Within grade range: student.grade - 1 to student.grade + 1
        potential_tutors = db.query(User).filter(
            User.id != student_id,
            User.grade_level.between(student.grade_level - 1, student.grade_level + 1),
            User.topic_scores[weak_topic].astext.cast(Integer) > 75
        ).all()

        for tutor in potential_tutors:
            tutor_score = tutor.topic_scores[weak_topic]
            if tutor_score - student_score >= 20:  # At least 20 point difference
                peer_tutors.append({
                    "student_id": student_id,
                    "peer_id": tutor.id,
                    "topic": weak_topic,
                    "match_type": "tutor_for_me",
                    "student_score": student_score,
                    "peer_score": tutor_score
                })

    # Find peers this student can help
    for strong_topic in strong_topics:
        student_score = student.topic_scores[strong_topic]

        # Find students who scored < 60% in this topic
        potential_learners = db.query(User).filter(
            User.id != student_id,
            User.grade_level.between(student.grade_level - 1, student.grade_level + 1),
            User.topic_scores[strong_topic].astext.cast(Integer) < 60
        ).all()

        for learner in potential_learners:
            learner_score = learner.topic_scores[strong_topic]
            if student_score - learner_score >= 20:  # At least 20 point difference
                peers_to_help.append({
                    "student_id": student_id,
                    "peer_id": learner.id,
                    "topic": strong_topic,
                    "match_type": "i_can_help",
                    "student_score": student_score,
                    "peer_score": learner_score
                })

    # Save matches to database
    save_peer_matches(peer_tutors + peers_to_help)

    return {
        "peer_tutors": peer_tutors[:5],  # Top 5
        "peers_to_help": peers_to_help[:5]
    }
```

### 4. Request/Offer Help Flow:

**Student requests help from peer tutor:**

```json
POST /api/peers/request-help

Request:
{
  "peer_id": 456,
  "topic": "Algebra",
  "message": "Hi! Can you help me with linear equations?"
}

Response:
{
  "session_id": 789,
  "status": "requested",
  "peer_name": "Sarah Johnson",
  "message": "Help request sent! Waiting for Sarah to accept."
}
```

**Student offers help to peer:**

```json
POST /api/peers/offer-help

Request:
{
  "peer_id": 789,
  "topic": "Geometry",
  "message": "I saw you need help with Geometry. I'd be happy to help!"
}

Response:
{
  "session_id": 790,
  "status": "offered",
  "peer_name": "Mike Chen",
  "message": "Help offer sent! Waiting for Mike to accept."
}
```

**Mark session as completed:**

```json
POST /api/peers/sessions/789/complete

Request:
{
  "feedback": "Great session! Sarah explained algebra really well.",
  "rating": 5
}

Response:
{
  "message": "Session marked as completed",
  "help_sessions_received": 3
}
```

---

## Important Rules for Backend Developer

### 1. Everyone is a Student - No Teachers

- Remove all teacher/tutor role logic
- Single user type: Student
- All users have same registration fields
- Peer-to-peer learning model

### 2. Initial Assessment Required

- New users CANNOT access dashboard until they complete initial assessment
- Check `has_taken_initial_assessment` flag
- Redirect to `/assessment/initial` if not completed

### 3. Only Math & English

- All assessments: Math or English only
- All study materials: Math or English only
- All peer matching: Based on Math/English topics only
- No other subjects

### 4. Topic Score Calculation

After each assessment:

- Calculate score for each topic (0-100%)
- Update `math_level` (average of all math topic scores)
- Update `reading_level` (average of all English topic scores)
- Update `topic_scores` JSON
- Re-classify weak (<60%) and strong (>75%) topics
- Re-run peer matching algorithm

### 5. Peer Matching Rules

- **For getting help**: Match with peers 0-1 grades different who scored >75% in weak topics
- **For giving help**: Match with peers 0-1 grades different who scored <60% in strong topics
- Minimum score difference: 20 points
- Same grade students can help each other if score gap > 20%
- Prioritize highest score difference

### 6. AI Integration Points

Backend needs AI for:

- Evaluating essay/written answers (score 0-100 + detailed feedback)
- Identifying specific weak concepts within topics
- Generating personalized study recommendations
- Creating topic-specific feedback

### 7. Grade Proximity Logic

```python
def can_match(student_grade, peer_grade):
    # Can match with same grade or +/- 1 grade
    return abs(student_grade - peer_grade) <= 1
```

---

## API Endpoints Frontend Expects

### Authentication:

- `POST /api/auth/register` - Register as student
- `POST /api/auth/login` - Login, returns JWT + user object with `has_taken_initial_assessment`

### Assessments:

- `GET /api/assessments/initial?grade=8` - Get initial assessment questions
- `POST /api/assessments/initial/submit` - Submit initial assessment
  - Returns: scores, weak/strong topics, peer matches, AI feedback
- `GET /api/assessments/weekly?subject=Math&grade=8` - Get weekly test
- `POST /api/assessments/:id/submit` - Submit any assessment

### Student Dashboard:

- `GET /api/students/me/dashboard` - Full dashboard data:
  - Personal stats
  - Weak/strong areas
  - Peer tutors for me
  - Peers I can help
  - Study materials
  - Recent activities

### Peer Help:

- `GET /api/peers/tutors-for-me` - Peers who can help with my weak topics
- `GET /api/peers/i-can-help` - Peers who need help in my strong topics
- `POST /api/peers/request-help` - Request help from a peer tutor
  ```json
  { "peer_id": 456, "topic": "Algebra", "message": "..." }
  ```
- `POST /api/peers/offer-help` - Offer to help a peer
  ```json
  { "peer_id": 789, "topic": "Geometry", "message": "..." }
  ```
- `GET /api/peers/sessions` - Get my help sessions (as helper and learner)
- `POST /api/peers/sessions/:id/accept` - Accept help request/offer
- `POST /api/peers/sessions/:id/complete` - Mark session complete
  ```json
  { "feedback": "Great session!", "rating": 5 }
  ```
- `POST /api/peers/sessions/:id/cancel` - Cancel session

### Study Materials:

- `GET /api/materials?subject=Math&topic=Algebra&grade=8` - Get materials
- `GET /api/materials/flashcards?topic=Algebra&grade=8` - Get flashcards
- `POST /api/materials` - Students can contribute materials (optional)

### Progress:

- `GET /api/students/me/progress` - Progress over time (topic scores, improvement)
- `GET /api/students/me/stats` - Overall statistics

---

## Frontend Tech Stack

- React 19
- React Router v7
- Zustand (state management)
- Tailwind CSS (fully responsive)
- Axios (API calls)
- Vite (build tool)

---

## Current Frontend Status

✅ 45+ components created
✅ All UI flows implemented
✅ Responsive design (mobile-friendly)
✅ Mock data in place for testing
⚠️ **NEEDS UPDATING** - Currently has teacher dashboard components that need to be removed/converted
⏳ Waiting for backend API implementation

---

## Frontend Files That Need Updating

### Files to REMOVE:

- `/frontend/src/pages/teacher/` (entire folder)
- `/frontend/src/components/teacher/` (entire folder)
- All teacher-related routes in router

### Files to UPDATE:

- `/frontend/src/pages/auth/Register.jsx` - Remove role selection, qualification field
- `/frontend/src/components/student/StudentDashboard.jsx` - Add peer teaching sections
- `/frontend/src/pages/student/StudentDashboardPage.jsx` - Update to show peer tutors and peers to help
- Create `/frontend/src/pages/assessment/InitialAssessment.jsx` - New initial assessment page
- Create `/frontend/src/components/peers/PeerCard.jsx` - Display peer tutor/learner cards
- Create `/frontend/src/components/peers/HelpRequestForm.jsx` - Form to request/offer help

---

## Testing the Frontend

The frontend can be tested with mock data. To connect to backend:

1. Update API base URL in frontend config
2. Backend should return data in exact JSON structures shown above
3. Frontend expects JWT token: `{ "access_token": "...", "token_type": "bearer" }`
4. All authenticated requests include: `Authorization: Bearer <token>`
5. After login, check `has_taken_initial_assessment` flag to determine redirect

---

## Next Steps for Backend

1. **Database Schema Update**:
   - Remove teacher-specific fields from User model
   - Add peer teaching fields
   - Create `PeerMatches` table
   - Create `HelpSessions` table
2. **Simplify Registration**:
   - Remove role/qualification
   - Only: name, email, password, grade_level, school_name
3. **Initial Assessment System**:
   - Create initial assessment endpoint
   - AI evaluation for all responses
   - Topic score calculation
   - Weak/strong topic identification
4. **Peer Matching Algorithm**:
   - Implement matching logic based on topic scores
   - Grade proximity rules (+/- 1 grade)
   - Minimum 20 point score difference
5. **Dashboard API**:
   - Return weak areas with peer tutors
   - Return strong areas with peers to help
   - Include help session statistics
6. **Peer Help System**:
   - Request/offer help endpoints
   - Accept/complete session endpoints
   - Track help statistics
7. **AI Integration**:
   - Written answer evaluation
   - Topic-specific feedback
   - Personalized study recommendations

**Key Change**: This is now a peer-to-peer learning platform, not a teacher-student platform. Every user is a student who can both learn and teach.

Refer to `BACKEND_IMPLEMENTATION_GUIDE.md` for detailed implementation steps (will need major updating for peer-to-peer model).
