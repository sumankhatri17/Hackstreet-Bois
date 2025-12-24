# EduAssess - Backend Implementation Guide

## Project Overview

EduAssess is an adaptive learning assessment platform that connects students with qualified teachers/tutors based on AI-powered evaluations. The system evaluates both students and teachers in **Math and English only**, then matches students with teachers who are qualified to teach their specific grade level and can help with their weak areas.

---

## Core Concept

### The Evaluation & Matching System

1. **Student Evaluation Process:**

   - Students take assessments in Math and English appropriate to their grade level (6-12)
   - AI analyzes responses to identify weak topics/areas
   - Students are scored on each topic (e.g., Algebra: 45%, Grammar: 52%)
   - Weak areas (score < 60%) trigger teacher matching

2. **Teacher Evaluation Process:**

   - Teachers/tutors (can be high school students, college students, or professionals) take Math and English assessments
   - Based on their performance, they are assigned a **specific grade level** they can teach
   - Examples:
     - A Grade 12 student scoring 85% might be qualified to teach Grade 7-9
     - A college junior scoring 88% might be qualified to teach Grade 8-10
     - A bachelor's degree holder scoring 92% might be qualified to teach Grade 9-12
   - Teachers are assigned **one primary grade** but can teach a **range** (e.g., Primary: Grade 9, Range: 7-10)

3. **Matching Algorithm:**
   - Match students with teachers who:
     - Can teach the student's grade level
     - Specialize in the student's weak subjects/topics
     - Have high evaluation scores in those areas
   - A Grade 8 student weak in Algebra should be matched with teachers who:
     - Can teach Grade 8 (within their grade range)
     - Have high Math scores
     - Specialize in Algebra topics

---

## User Roles & Workflows

### 1. Student Role

**Registration:**

```json
{
  "email": "student@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "student",
  "school_name": "Lincoln High School",
  "grade_level": "8" // Specific grade: 6, 7, 8, 9, 10, 11, or 12
}
```

**Student Workflow:**

1. Register with grade level and school
2. Take initial Math & English assessments (questions appropriate to their grade)
3. System identifies weak areas (topics scoring < 60%)
4. View dashboard showing:
   - Current grade
   - Math proficiency % (overall score)
   - English proficiency % (overall score)
   - Weak topics with scores
   - Matched teachers qualified for their grade
   - Study materials (flashcards, notes, videos) for weak topics
5. Request tutoring sessions with matched teachers
6. Take weekly assessments to track improvement
7. View progress over time

**Key Student Data:**

- `current_level`: Grade (6-12)
- `math_level`: Overall Math proficiency % (0-100)
- `reading_level`: Overall English proficiency % (0-100)
- `weaknesses`: Array of weak topics with scores
  ```json
  [
    { "topic": "Algebra", "subject": "Math", "score": 45, "gradeLevel": 8 },
    {
      "topic": "Sentence Structure",
      "subject": "English",
      "score": 52,
      "gradeLevel": 8
    }
  ]
  ```

### 2. Teacher Role

**Registration:**

```json
{
  "email": "teacher@example.com",
  "name": "Sarah Johnson",
  "password": "password123",
  "role": "teacher",
  "school_name": "State University",
  "qualification": "bachelors" // high_school, college, bachelors, masters, phd, professional
}
```

**Teacher Workflow:**

1. Register with qualification level
2. Take evaluation assessments in Math & English
3. AI assigns teaching level based on performance:
   - Score 70-79%: Can teach 2 grades below current level
   - Score 80-89%: Can teach 1-3 grades below current level
   - Score 90%+: Can teach up to 4 grades below current level
4. View dashboard showing:
   - Primary teaching grade
   - Grade range they can teach
   - Evaluation score
   - Teaching subjects (Math/English) with proficiency
   - Assigned students with their weak areas
   - Match reasons for each student
5. View student progress
6. Schedule tutoring sessions
7. Create/assign study materials

**Key Teacher Data:**

- `qualification`: Education level
- `teaching_level`: Primary grade they teach (e.g., 9)
- `can_teach_grades`: Range string (e.g., "7-10")
- `evaluation_score`: Their assessment score (0-100)
- `specializations`: Comma-separated topics they excel at
  ```
  "Algebra,Geometry,Linear Equations"
  ```

### 3. Admin Role

**Admin Capabilities:**

- Manage schools
- View all users
- View system analytics
- Manage assessments and questions
- Override teacher assignments
- Monitor platform performance

---

## Database Schema Requirements

### Users Table (Extended)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  hashed_password VARCHAR NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  school_id INTEGER REFERENCES schools(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- New fields for enhanced system
  school_name VARCHAR,  -- School/institution name
  grade_level VARCHAR,  -- For students: "6", "7", "8", "9", "10", "11", "12"
  qualification VARCHAR,  -- For teachers: "high_school", "college", "bachelors", etc.

  -- Student-specific
  current_level INTEGER,  -- Student's grade as integer
  math_level INTEGER,  -- Math proficiency % (0-100)
  reading_level INTEGER,  -- English proficiency % (0-100)

  -- Teacher-specific
  teaching_level INTEGER,  -- Primary grade they teach (e.g., 9)
  can_teach_grades VARCHAR,  -- Range string (e.g., "7-10")
  evaluation_score INTEGER,  -- Assessment score (0-100)
  specializations VARCHAR  -- Comma-separated topics (e.g., "Algebra,Geometry")
);
```

### Assessments Table

```sql
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  subject VARCHAR NOT NULL,  -- "Math" or "English"
  grade_level INTEGER NOT NULL,  -- Assessment for grade 6-12
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score INTEGER NOT NULL,  -- Percentage (0-100)
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assessment_type VARCHAR,  -- "initial", "weekly", "practice"

  -- AI analysis results
  weak_topics JSON,  -- Array of topics with scores
  strong_topics JSON,  -- Array of topics with scores
  ai_feedback TEXT  -- Personalized feedback
);
```

### Questions Table

```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  subject VARCHAR NOT NULL,  -- "Math" or "English"
  topic VARCHAR NOT NULL,  -- "Algebra", "Grammar", "Geometry", etc.
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  grade_level INTEGER NOT NULL,  -- Question for grade 6-12
  question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'written'),
  question_text TEXT NOT NULL,
  options JSON,  -- For MCQ: ["option1", "option2", "option3", "option4"]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Student Responses Table

```sql
CREATE TABLE student_responses (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id),
  assessment_id INTEGER REFERENCES assessments(id),
  answer TEXT NOT NULL,
  is_correct BOOLEAN,
  ai_score INTEGER,  -- For written answers: AI-assigned score (0-100)
  ai_feedback TEXT,  -- AI feedback on written answers
  time_taken INTEGER,  -- Seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Progress Tracking Table

```sql
CREATE TABLE progress (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) UNIQUE,

  -- Overall metrics
  total_assessments INTEGER DEFAULT 0,
  math_progress JSON,  -- { "current": 72, "history": [65, 68, 72], "trend": "improving" }
  english_progress JSON,  -- { "current": 68, "history": [60, 65, 68], "trend": "improving" }

  -- Topic-specific tracking
  weak_topics JSON,  -- [{ "topic": "Algebra", "score": 45, "attempts": 3, "improving": false }]
  mastered_topics JSON,  -- [{ "topic": "Grammar Basics", "score": 85, "masteredAt": "2024-01-15" }]

  -- Study material engagement
  flashcards_reviewed INTEGER DEFAULT 0,
  practice_tests_taken INTEGER DEFAULT 0,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Teacher-Student Matching Table

```sql
CREATE TABLE teacher_student_matches (
  id INTEGER PRIMARY KEY,
  teacher_id INTEGER REFERENCES users(id),
  student_id INTEGER REFERENCES users(id),
  subject VARCHAR NOT NULL,  -- "Math" or "English"
  topics JSON NOT NULL,  -- ["Algebra", "Linear Equations"]
  match_score INTEGER,  -- Matching algorithm score (0-100)
  match_reason TEXT,  -- "Needs help in Grade 8 Math topics"
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  sessions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(teacher_id, student_id, subject)
);
```

### Study Materials Table

```sql
CREATE TABLE study_materials (
  id INTEGER PRIMARY KEY,
  subject VARCHAR NOT NULL,  -- "Math" or "English"
  topic VARCHAR NOT NULL,
  grade_level INTEGER NOT NULL,
  material_type ENUM('flashcards', 'video', 'notes', 'practice_set', 'study_guide'),
  title VARCHAR NOT NULL,
  content JSON,  -- For flashcards: [{ "question": "...", "answer": "...", "explanation": "..." }]
  file_url VARCHAR,  -- For videos/PDFs
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Required

### Authentication

- `POST /api/auth/register` - Register student/teacher with new fields
- `POST /api/auth/login` - Login and return JWT token

### Student Endpoints

- `GET /api/students/me` - Get current student profile
- `GET /api/students/me/dashboard` - Get dashboard data (stats, weaknesses, matched teachers)
- `GET /api/students/me/assessments` - Get assessment history
- `GET /api/students/me/progress` - Get detailed progress tracking
- `GET /api/students/me/matched-teachers` - Get teachers matched for this student
- `GET /api/students/me/study-materials` - Get recommended materials based on weaknesses
- `POST /api/students/me/request-session` - Request tutoring session with teacher

### Teacher Endpoints

- `GET /api/teachers/me` - Get current teacher profile
- `GET /api/teachers/me/dashboard` - Get dashboard data (stats, subjects, assigned students)
- `GET /api/teachers/me/assigned-students` - Get students assigned to this teacher
- `GET /api/teachers/me/evaluation` - Get evaluation results
- `GET /api/teachers/students/:studentId/progress` - View specific student's progress
- `POST /api/teachers/materials` - Create/upload study materials

### Assessment Endpoints

- `GET /api/assessments/start` - Start new assessment (gets questions for student's grade)
  - Query params: `?subject=Math&grade=8&type=initial`
- `POST /api/assessments/:id/submit` - Submit assessment answers
  - Triggers AI evaluation for written answers
  - Calculates scores
  - Updates student weaknesses
  - Triggers teacher matching algorithm
- `GET /api/assessments/:id/results` - Get detailed results with AI feedback
- `GET /api/questions` - Get questions for assessment (filtered by grade/subject)

### Teacher Evaluation Endpoints

- `POST /api/teachers/evaluation/start` - Start teacher evaluation
- `POST /api/teachers/evaluation/submit` - Submit evaluation
  - AI analyzes responses
  - Calculates teaching level
  - Assigns grade range
  - Identifies specializations
  - Returns: `{ teaching_level: 9, can_teach_grades: "7-10", evaluation_score: 88, specializations: [...] }`

### Matching Algorithm Endpoint

- `POST /api/matching/run` - Run matching algorithm for a student
  - Input: `student_id`
  - Analyzes student weaknesses
  - Finds teachers who:
    - Can teach student's grade
    - Specialize in weak topics
    - Have high evaluation scores
  - Returns ranked list of matches with reasons
- `POST /api/matching/run-all` - Re-run matching for all students (admin/cron)

### Progress Tracking

- `GET /api/progress/:studentId` - Get student progress over time
- `PUT /api/progress/:studentId` - Update progress (triggered after assessment)

### Study Materials

- `GET /api/materials` - Get study materials
  - Query: `?subject=Math&topic=Algebra&grade=8&type=flashcards`
- `POST /api/materials` - Create new material (teacher/admin)
- `GET /api/materials/:id` - Get specific material with content

### Admin Endpoints

- `GET /api/admin/users` - List all users with filters
- `GET /api/admin/analytics` - System analytics
- `POST /api/admin/questions/bulk` - Bulk upload questions
- `PUT /api/admin/teachers/:id/override-level` - Manually adjust teaching level

---

## AI Integration Requirements

### 1. Assessment AI (Question Generation & Scoring)

**For Multiple Choice Questions:**

- Auto-grade based on correct answer
- Track which topics are weak

**For Written Answers (Short Answer/Essay):**

- Use AI model (OpenAI GPT, Claude, or similar) to:
  - Score answer on scale 0-100
  - Check for key concepts
  - Evaluate understanding depth
  - Provide personalized feedback

**Example AI Prompt for Written Answer Evaluation:**

```
You are evaluating a Grade 8 student's answer to a Math question about Algebra.

Question: "Explain how to solve the equation 2x + 5 = 13"

Student's Answer: "[student answer here]"

Correct Concept: Subtract 5 from both sides to get 2x = 8, then divide by 2 to get x = 4.

Evaluate this answer and provide:
1. Score (0-100)
2. Whether key concepts are understood
3. Specific feedback for improvement
4. Topic areas needing work

Return JSON: { "score": 85, "understood_concepts": ["isolation", "division"], "missing_concepts": ["verification"], "feedback": "...", "weak_areas": ["equation verification"] }
```

### 2. Teacher Evaluation AI

**Algorithm to Determine Teaching Level:**

```python
def calculate_teaching_level(teacher_qualification, math_score, english_score):
    avg_score = (math_score + english_score) / 2

    # Base level from qualification
    base_levels = {
        "high_school": 12,      # Currently in high school
        "college": 14,           # College student (equivalent to Grade 14)
        "bachelors": 16,         # Bachelor's degree
        "masters": 18,           # Master's degree
        "phd": 20,               # PhD
        "professional": 20       # Professional teacher
    }

    teacher_level = base_levels.get(qualification, 12)

    # Calculate how many grades below they can teach based on score
    if avg_score >= 90:
        teach_below = 4  # Can teach 4 grades below
    elif avg_score >= 80:
        teach_below = 3  # Can teach 3 grades below
    elif avg_score >= 70:
        teach_below = 2  # Can teach 2 grades below
    else:
        teach_below = 1  # Can teach 1 grade below

    # Calculate teaching range
    primary_grade = min(teacher_level - 2, 12)  # Primary grade to teach
    min_grade = max(primary_grade - teach_below + 1, 6)
    max_grade = min(primary_grade + 1, 12)

    can_teach_grades = f"{min_grade}-{max_grade}"

    # Identify specializations based on topic-level scores
    specializations = identify_strong_topics(responses)

    return {
        "teaching_level": primary_grade,
        "can_teach_grades": can_teach_grades,
        "evaluation_score": avg_score,
        "specializations": specializations
    }
```

**Example:**

- College junior (level 14), scores 88% on evaluation
- Can teach 3 grades below → Primary: Grade 9, Range: 7-10
- Strong in Algebra (95%), Geometry (90%) → Specializations: ["Algebra", "Geometry"]

### 3. Matching Algorithm AI

```python
def match_students_with_teachers(student_id):
    student = get_student(student_id)
    grade = student.current_level
    weaknesses = student.weaknesses  # [{ topic: "Algebra", subject: "Math", score: 45 }]

    # Find teachers who can teach this grade
    eligible_teachers = get_teachers_for_grade(grade)

    matches = []
    for teacher in eligible_teachers:
        match_score = 0
        matching_topics = []

        for weakness in weaknesses:
            # Check if teacher specializes in this weak topic
            if weakness.topic in teacher.specializations:
                match_score += 30  # High bonus for direct match
                matching_topics.append(weakness.topic)

            # Check if teacher is strong in the subject
            if weakness.subject == "Math" and teacher.math_score >= 80:
                match_score += 10
            if weakness.subject == "English" and teacher.english_score >= 80:
                match_score += 10

        # Bonus for higher evaluation score
        match_score += teacher.evaluation_score * 0.3

        # Penalty if teacher already has many students
        if teacher.assigned_students_count > 10:
            match_score -= 20

        if match_score > 40:  # Minimum threshold
            matches.append({
                "teacher": teacher,
                "score": match_score,
                "matching_topics": matching_topics,
                "reason": generate_match_reason(student, teacher, matching_topics)
            })

    # Sort by match score and return top 5
    return sorted(matches, key=lambda x: x['score'], reverse=True)[:5]

def generate_match_reason(student, teacher, topics):
    if len(topics) > 1:
        return f"Needs help in Grade {student.grade} {', '.join(topics[:-1])} and {topics[-1]}"
    elif len(topics) == 1:
        return f"Weak in {topics[0]} - {teacher.name} specializes in this"
    else:
        return f"Qualified to teach Grade {student.grade} Math & English"
```

---

## Backend Implementation Priority

### Phase 1: Core Setup (Days 1-2)

1. ✅ Update User model with new fields (already done in models/user.py)
2. ✅ Update schemas (already done in schemas/user.py)
3. ✅ Update auth routes (already done in routes/auth.py)
4. Create database migration script to add new columns
5. Test registration endpoint with new fields

### Phase 2: Assessment System (Days 3-5)

1. Seed database with grade-appropriate Math & English questions
   - Create 50+ questions per grade (6-12) per subject
   - Include MCQ, short answer, and essay questions
2. Implement assessment start endpoint
3. Implement assessment submission with AI scoring
4. Integrate OpenAI/Claude API for written answer evaluation
5. Calculate student weaknesses after assessment

### Phase 3: Teacher Evaluation (Days 6-7)

1. Create teacher evaluation questions
2. Implement evaluation submission endpoint
3. Implement teaching level calculation algorithm
4. Auto-assign grade ranges and specializations
5. Test with various qualification levels

### Phase 4: Matching Algorithm (Days 8-9)

1. Implement teacher-student matching logic
2. Create matching API endpoint
3. Store matches in database
4. Test matching with various scenarios

### Phase 5: Study Materials (Days 10-11)

1. Create study materials table
2. Seed with sample flashcards and materials
3. Implement material recommendation logic
4. Create material retrieval endpoints

### Phase 6: Dashboard APIs (Days 12-13)

1. Implement student dashboard endpoint
2. Implement teacher dashboard endpoint
3. Aggregate data from multiple tables
4. Optimize queries for performance

### Phase 7: Progress Tracking (Days 14-15)

1. Implement progress calculation logic
2. Create progress update triggers
3. Track improvement over time
4. Generate progress reports

### Phase 8: Testing & Optimization (Days 16-18)

1. End-to-end testing of all flows
2. Performance optimization
3. Add error handling
4. Write API documentation

---

## Environment Variables Needed

```env
# Database
DATABASE_URL=sqlite:///./eduassess.db  # or PostgreSQL URL

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
OPENAI_API_KEY=sk-...  # For written answer evaluation
# OR
ANTHROPIC_API_KEY=sk-...  # If using Claude

# Frontend
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

---

## Testing Scenarios

### Scenario 1: Student Registration & Assessment

1. Student (Grade 8) registers
2. Takes initial Math assessment
3. Scores 45% on Algebra, 80% on Geometry
4. System identifies Algebra as weakness
5. Matches with teachers who:
   - Can teach Grade 8
   - Specialize in Algebra
6. Student dashboard shows matched teachers

### Scenario 2: Teacher Evaluation

1. College student registers as teacher
2. Takes evaluation (Math: 88%, English: 85%)
3. System assigns:
   - Primary teaching grade: 9
   - Can teach grades: 7-10
   - Specializations: Algebra, Geometry
4. Teacher dashboard shows they can teach Grades 7-10

### Scenario 3: Matching

1. Grade 8 student weak in Algebra (45%)
2. System finds Grade 9-qualified teacher with Algebra specialization
3. Match created with reason: "Needs help in Grade 8 Algebra"
4. Teacher sees student in "Assigned Students"
5. Student sees teacher in "Matched Teachers"

---

## Frontend-Backend Data Flow

### Student Dashboard Load:

```
GET /api/students/me/dashboard
→ Returns:
{
  "student": { name, grade, math_level, reading_level, tests_completed },
  "weaknesses": [{ topic, subject, score, gradeLevel }],
  "matched_teachers": [{ name, qualification, teaching_level, can_teach_grades, specializations, evaluation_score }],
  "study_materials": [{ title, topic, type, icon }],
  "recent_activities": [...],
  "upcoming_tests": [...]
}
```

### Teacher Dashboard Load:

```
GET /api/teachers/me/dashboard
→ Returns:
{
  "teacher": { name, teaching_level, can_teach_grades, qualification, evaluation_score },
  "stats": { total_students, active_assessments, avg_performance, pending_reviews },
  "teaching_subjects": [{ name, proficiency, topics, students_count, assigned_grades }],
  "assigned_students": [{ name, grade, status, weak_areas, match_reason }],
  "recent_activity": [...],
  "upcoming_classes": [...]
}
```

---

## Notes for Backend Developer

1. **Database Migration:** The User model changes have been made in the code. You need to:

   - Drop existing `eduassess.db` file
   - Run `python -m app.db.init_db` to create new schema
   - Run `python -m app.db.seed` to add sample data

2. **AI Integration:** You'll need to integrate an AI service (OpenAI or Claude) for:

   - Evaluating written answers
   - Providing feedback
   - Consider cost optimization (cache common answers, use smaller models for simple questions)

3. **Matching Algorithm:** The matching logic should run:

   - After each student assessment
   - When new teachers complete evaluation
   - Via cron job daily to optimize all matches

4. **Performance:** Consider:

   - Indexing on grade_level, subject, topic columns
   - Caching dashboard data
   - Lazy loading for large datasets

5. **Security:** Ensure:

   - Students can only access their own data
   - Teachers can only see their assigned students
   - Admins have full access

6. **Testing:** Create test fixtures for:
   - Multiple students at different grades
   - Teachers with various qualifications
   - Questions across all grades and topics

---

## Questions for Clarification

1. Should teachers be able to teach multiple grade ranges? (Currently: No, one range per teacher)
2. How often should matching algorithm re-run? (Suggested: After each assessment + daily cron)
3. Should students be able to request specific teachers outside matches? (Suggested: Yes, but with approval)
4. What's the minimum number of questions per assessment? (Suggested: 20 questions)
5. Should we support video sessions or just scheduling? (To be decided)

---

## Contact & Collaboration

- Frontend is complete with all UI components
- Mock data structure is in place
- API integration points are ready
- Focus backend work on these endpoints first:
  1. `/api/auth/register` (with new fields)
  2. `/api/students/me/dashboard`
  3. `/api/teachers/me/dashboard`
  4. `/api/assessments/*` endpoints

Good luck with the implementation! 🚀
