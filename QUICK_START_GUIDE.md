# 🎯 Quick Start Guide - EduAssess Peer-to-Peer Learning Platform

## 📖 Project Overview

**EduAssess** is a peer-to-peer adaptive learning platform where students help each other learn Math and English (grades 6-12).

### Core Concept:

- **No teachers** - everyone is a student
- After taking an assessment, students are matched with:
  - **Peer tutors** (other students strong in their weak areas)
  - **Peers they can help** (other students weak in their strong areas)
- Students are both learners AND tutors

---

## 🚀 User Journey

### 1. Registration

- Student enters: name, email, password, grade (6-12), school
- No role selection - everyone is a student

### 2. Initial Assessment (Required)

- **Cannot skip** - must complete before dashboard access
- 20-30 questions covering Math & English topics
- Mix of MCQ, True/False, Short Answer, Essay questions
- AI evaluates all responses

### 3. Results & Matching

System calculates:

- Overall Math proficiency (0-100%)
- Overall English proficiency (0-100%)
- Topic-specific scores (Algebra: 45%, Geometry: 88%, etc.)
- **Weak topics** (score < 60%)
- **Strong topics** (score > 75%)

System automatically matches:

- Peers who can tutor you (strong in your weak topics)
- Peers you can tutor (weak in your strong topics)

### 4. Dashboard Access

Student sees:

- Their proficiency levels
- Weak areas with matched peer tutors
- Strong areas with peers they can help
- Study materials for weak topics
- **Teaching materials for strong topics** (NEW) - Lesson plans and guides to help teach peers
- Recent activities and upcoming tests
- **"Retake Assessment" button** (NEW) - Update skill levels anytime

### 5. Peer Help Sessions

- Student clicks "Request Help" from a peer tutor
- Or clicks "Offer Help" to a peer who needs it
- Peer accepts → they conduct session
- After session → both mark as completed
- Statistics update (sessions given/received, peers helped)

### 6. Continuous Learning

- Take weekly assessments or **retake assessment anytime** via dashboard button
- Topic scores update automatically
- Peer matches refresh based on new scores
- Track progress over time
- Access teaching materials to improve teaching skills

---

## 🗂️ Project Structure

```
Hackstreet-Bois/
├── frontend/                  # React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── student/      # Student Dashboard
│   │   │   └── assessment/   # Assessment pages
│   │   ├── components/
│   │   │   ├── student/      # Dashboard components
│   │   │   ├── assessment/   # Question components
│   │   │   ├── peers/        # Peer tutor/learner cards
│   │   │   └── common/       # Shared UI components
│   │   └── stores/           # Zustand state management
│   └── package.json
│
├── backend/                   # FastAPI server
│   ├── app/
│   │   ├── models/           # Database models
│   │   │   ├── user.py
│   │   │   ├── assessment.py
│   │   │   ├── peer_match.py
│   │   │   └── help_session.py
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── api/routes/       # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── students.py
│   │   │   ├── assessments.py
│   │   │   └── peers.py
│   │   ├── services/         # Business logic
│   │   │   ├── ai_service.py
│   │   │   └── peer_matching.py
│   │   └── db/               # Database setup
│   └── requirements.txt
│
├── FRONTEND_IMPLEMENTATION_SUMMARY_V2.md  # Frontend API specs
├── PROJECT_CHANGES_SUMMARY.md             # What changed
└── README.md
```

---

## 🔑 Key Components

### User Model

```python
id, email, name, hashed_password
school_name, grade_level (6-12)
has_taken_initial_assessment (Boolean)
math_level, reading_level (0-100)
topic_scores (JSON: {"Algebra": 45, "Geometry": 88, ...})
weak_topics (String: "Algebra,Grammar")
strong_topics (String: "Geometry,Reading")
help_sessions_given, help_sessions_received
peers_helped (count)
```

### PeerMatch Model

```python
student_id, peer_id
match_type ("tutor_for_me" or "i_can_help")
topic, subject
student_score, peer_score
```

### HelpSession Model

```python
helper_id, learner_id
topic, subject
status ("requested", "accepted", "completed", "cancelled")
feedback, rating
```

---

## 🎨 Tech Stack

### Frontend:

- React 19
- React Router v7
- Zustand (state management)
- Tailwind CSS
- Axios
- Vite

### Backend:

- FastAPI
- SQLAlchemy
- PostgreSQL/SQLite
- JWT authentication
- Bcrypt
- OpenAI/Claude API (for AI evaluation)

---

## 🌐 Key API Endpoints

### Auth:

- `POST /api/auth/register` - Register student
- `POST /api/auth/login` - Login

### Assessments:

- `GET /api/assessments/initial?grade=8` - Get initial assessment
- `POST /api/assessments/initial/submit` - Submit (triggers AI eval + matching)
- `GET /api/assessments/:id/results` - Get results

### Students:

- `GET /api/students/me/dashboard` - Complete dashboard data
- `GET /api/students/me/progress` - Progress over time

### Peers:

- `GET /api/peers/tutors-for-me` - Peer tutors who can help me
- `GET /api/peers/i-can-help` - Peers I can help
- `POST /api/peers/request-help` - Request help from peer
- `POST /api/peers/offer-help` - Offer help to peer
- `GET /api/peers/sessions` - My help sessions
- `POST /api/peers/sessions/:id/complete` - Mark session done

### Materials:

- `GET /api/materials?topic=Algebra&grade=8` - Get study materials
- `GET /api/materials/flashcards?topic=Algebra&grade=8` - Get flashcards

---

## 🧮 Peer Matching Algorithm

```python
def match_peers(student):
    # For each weak topic (score < 60%):
    #   Find peers who scored > 75% in that topic
    #   Within grade ± 1
    #   Score difference ≥ 20 points

    # For each strong topic (score > 75%):
    #   Find peers who scored < 60% in that topic
    #   Within grade ± 1
    #   Score difference ≥ 20 points

    # Return top 5 matches for each category
```

### Matching Rules:

- ✅ Grade proximity: ±1 grade only
- ✅ Tutor threshold: >75% in topic
- ✅ Learner threshold: <60% in topic
- ✅ Minimum gap: 20 points difference
- ✅ Same grade OK if gap >20 points

---

## 🤖 AI Integration

AI is used for:

1. **Evaluating written/essay answers**

   - Score: 0-100
   - Detailed feedback
   - Identify specific mistakes

2. **Topic-specific feedback**

   - What concepts student struggles with
   - Personalized improvement suggestions

3. **Study material recommendations**
   - Based on weak areas
   - Appropriate for grade level

---

## 📚 Documentation Files

### For You (Overview):

- **PROJECT_CHANGES_SUMMARY.md** ← YOU ARE HERE
  - What changed from teacher-student to peer-to-peer
  - Migration checklist
  - Example scenarios

### For Backend Developer:

- **FRONTEND_IMPLEMENTATION_SUMMARY_V2.md**
  - Complete API specifications
  - Exact JSON structures expected
  - Data flow examples
  - Database schema requirements

### For Team:

- **FEATURES.md** (needs updating)
  - Feature list (currently has teacher features - needs rewrite)
- **BACKEND_IMPLEMENTATION_GUIDE.md** (needs updating)
  - Implementation plan (currently for teacher-student model - needs rewrite)

---

## 🛠️ Development Setup

### Frontend:

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend:

```bash
cd backend
pip install -r requirements.txt

# Set environment variables
$env:PYTHONPATH = "path\to\backend"
$env:DATABASE_URL = "sqlite:///./eduassess.db"
$env:SECRET_KEY = "your-secret-key"
$env:OPENAI_API_KEY = "your-openai-key"

# Initialize database
python -m app.db.init_db

# Run server
uvicorn app.main:app --reload
# Runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

---

## ✅ What's Done

### Frontend:

- ✅ 45+ React components created
- ✅ Registration, Login, Dashboard pages
- ✅ Assessment components (MCQ, Essay, etc.)
- ✅ Flashcard viewer
- ✅ Fully responsive (mobile-friendly)
- ✅ Mock data in place

### Backend:

- ✅ FastAPI structure set up
- ✅ User model (needs updating for peer fields)
- ✅ Authentication (JWT)
- ✅ Database setup (SQLite/PostgreSQL)
- ✅ Docker configuration

---

## 🔧 What Needs Work

### Frontend:

- ⚠️ Remove teacher pages/components
- ⚠️ Update registration (remove role selector)
- ⚠️ Create initial assessment page
- ⚠️ Update dashboard with peer sections
- ⚠️ Create peer help components

### Backend:

- ⚠️ Update User model (add peer fields)
- ⚠️ Create PeerMatch and HelpSession models
- ⚠️ Implement initial assessment endpoint
- ⚠️ Implement peer matching algorithm
- ⚠️ Create peer help endpoints
- ⚠️ Integrate AI for essay evaluation
- ⚠️ Update dashboard endpoint

### Documentation:

- ⚠️ Update FEATURES.md (remove teacher features)
- ⚠️ Rewrite BACKEND_IMPLEMENTATION_GUIDE.md

---

## 🎯 Next Steps (Priority Order)

### Week 1: Database & Models

1. Update User model (remove teacher fields, add peer fields)
2. Create PeerMatch model
3. Create HelpSession model
4. Run migrations
5. Update seed data

### Week 2: Core Endpoints

1. Update registration endpoint (simplified)
2. Create initial assessment endpoint
3. Integrate AI for essay grading
4. Implement topic score calculation
5. Identify weak/strong topics

### Week 3: Peer Matching

1. Implement peer matching algorithm
2. Create peer help endpoints
3. Update dashboard endpoint with peer data
4. Test matching logic

### Week 4: Frontend Updates

1. Remove teacher pages
2. Update registration form
3. Create initial assessment page
4. Update dashboard with peer sections
5. Create peer help UI components

### Week 5: Testing & Polish

1. End-to-end testing
2. Fix bugs
3. UI improvements
4. Performance optimization
5. Documentation updates

---

## 📞 Questions?

Refer to these docs:

- **API specs**: FRONTEND_IMPLEMENTATION_SUMMARY_V2.md
- **What changed**: PROJECT_CHANGES_SUMMARY.md
- **Setup issues**: Check backend README or run `python -m app.db.init_db`

---

## 🎓 Key Principles

1. **Everyone is a student** - No teacher role
2. **Peer-to-peer** - Students help each other
3. **Math & English only** - No other subjects
4. **Grade-based** - Match within ±1 grade
5. **Score-based** - Match by topic proficiency
6. **Initial assessment required** - Must complete before dashboard
7. **Continuous improvement** - Regular assessments update matches

---

**Remember**: This is a collaborative learning platform where students learn by both receiving help AND giving help. The better you do, the more you can help others! 🚀
