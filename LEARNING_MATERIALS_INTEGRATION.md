# Learning Materials Integration - Implementation Summary

## Overview
Integrated the AI-powered learning materials generator with the existing assessment system to provide personalized study plans for students.

## What Was Built

### 1. Backend Components

#### Database Model (`backend/app/models/learning_material.py`)
- `LearningMaterial` table stores personalized learning plans
- Fields: student_id, subject, content (JSON), generated_at, expires_at, is_active
- Links to User model with relationship

#### Service (`backend/app/services/Learning_materials.py`)
**Key Functions:**
- `generate_learning_materials()` - Main service function that:
  - Pulls student weakness data from `StudentChapterPerformance` table
  - Calls Mistral AI for each weak chapter
  - Generates roadmap with resources, prerequisites, study steps
  - Caches results for 7 days (configurable)
  - Deactivates old plans when generating new ones

- `get_student_weakness_data()` - Fetches chapter-level performance from DB
- `generate_chapter_plan()` - AI-powered chapter-specific plan generation

**AI Integration:**
- Uses Mistral AI (mistral-small-latest model)
- Generates JSON with strict schema enforcement
- 3 retry attempts per chapter
- Fallback mechanism if AI fails

#### API Routes (`backend/app/api/routes/learning_materials.py`)
- `POST /learning-materials/generate/{subject}` - Generate new plan
- `GET /learning-materials/my-materials` - Get user's plans (with subject filter)
- `GET /learning-materials/materials/{id}` - Get specific plan
- `DELETE /learning-materials/materials/{id}` - Archive plan

#### Migration (`backend/migrations/add_learning_materials.py`)
- Creates learning_materials table
- Run with: `python backend/migrations/add_learning_materials.py`

### 2. Frontend Components

#### Service (`frontend/src/services/learningMaterials.service.js`)
- `generateMaterials(subject, forceRegenerate)` - Trigger AI generation
- `getMyMaterials(subject)` - Fetch saved plans
- `getMaterialById(id)` - Get specific plan
- `archiveMaterial(id)` - Delete plan

#### LearningRoadmap Component (`frontend/src/components/student/LearningRoadmap.jsx`)
**Features:**
- Subject-specific learning plans
- Summary cards: weekly hours, duration, chapter count, critical areas
- Expandable chapter cards with:
  - Weakness level badges (Critical/Needs Focus/Minor Gap)
  - Priority ranking
  - Prerequisites with explanations
  - Step-by-step roadmap
  - Curated external resources (clickable links)
- Generate/Regenerate buttons
- Color-coded by severity (red=severe, orange=moderate, green=mild)

#### Updated ResourcesPage (`frontend/src/pages/student/ResourcesPage.jsx`)
- Two tabs: "Learning Roadmap" and "Browse Resources"
- Subject filter buttons (Mathematics, English, Science)
- Integrates new LearningRoadmap with existing ResourcesList

## How It Works

### Workflow:
1. **Student completes assessments** → Performance stored in `StudentChapterPerformance`
2. **Student visits Resources page** → Sees "Generate Learning Plan" button
3. **Clicks Generate** → Backend:
   - Queries DB for weak chapters (severity: severe/moderate/mild)
   - Calls Mistral AI per chapter for personalized recommendations
   - Saves complete plan to `learning_materials` table
4. **Frontend displays roadmap** with interactive cards, resources, and study steps
5. **Plan cached for 7 days** to avoid repeated AI calls

### Data Flow:
```
Assessments → StudentChapterPerformance (DB)
                        ↓
                Weakness Analysis
                        ↓
                   Mistral AI
                        ↓
              LearningMaterial (DB)
                        ↓
                Frontend Display
```

### AI-Generated Content Structure:
```json
{
  "subject": "Mathematics",
  "chapters": [
    {
      "chapter_name": "Algebra",
      "weakness_level": "severe",
      "priority": 5,
      "estimated_time_hours": 6,
      "prerequisites": [...],
      "roadmap_steps": [...],
      "resources": [
        {
          "title": "Khan Academy Algebra",
          "url": "https://...",
          "type": "video",
          "level": "beginner",
          "estimated_time_minutes": 30
        }
      ]
    }
  ],
  "global_recommendations": {
    "weekly_study_hours": 8,
    "minimum_duration_weeks": 6,
    "assessment_checkpoints_weeks": [2, 4, 6]
  }
}
```

## Key Features

✅ **Fully Integrated** - Uses existing assessment data, no manual input needed
✅ **Smart Caching** - Reuses plans for 7 days, option to force regenerate
✅ **AI-Powered** - Mistral AI generates personalized resources per weakness level
✅ **Curated Resources** - Only trusted sources (Khan Academy, BBC Bitesize, etc.)
✅ **Interactive UI** - Expandable cards, color-coded severity, progress tracking
✅ **Reuses Components** - Leverages existing Card, Badge, Button components
✅ **Severity-Aware** - More resources for severe weaknesses, fewer for mild

## Testing Steps

1. **Run Migration:**
   ```bash
   cd backend
   python migrations/add_learning_materials.py
   ```

2. **Ensure MISTRAL_API_KEY in .env:**
   ```
   MISTRAL_API_KEY=your_key_here
   ```

3. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```

4. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Test Flow:**
   - Login as student (e.g., Ron, user_id=3)
   - Complete assessments if needed
   - Navigate to Resources page
   - Click "Learning Roadmap" tab
   - Select subject (Mathematics/English/Science)
   - Click "Generate Learning Plan"
   - Explore generated roadmap

## Configuration

### Adjust Settings in `Learning_materials.py`:

**Cache Duration:**
```python
LearningMaterial.generated_at > datetime.utcnow() - timedelta(days=7)
# Change days=7 to your preference
```

**Study Time Calculation:**
```python
if severe_count >= 3:
    weekly_hours = 8
    min_weeks = 8
# Modify thresholds and values
```

**AI Model:**
```python
model="mistral-small-latest"
# Can change to other Mistral models
```

## Future Enhancements

- [ ] Progress tracking per roadmap step
- [ ] Completion checkboxes for study steps
- [ ] Generate flashcards from weak chapters
- [ ] Email reminders for assessment checkpoints
- [ ] Teacher dashboard to view student plans
- [ ] Export PDF of learning plan
- [ ] Integration with calendar for scheduling

## Files Modified/Created

**Backend:**
- `app/models/learning_material.py` (new)
- `app/services/Learning_materials.py` (refactored)
- `app/api/routes/learning_materials.py` (new)
- `app/schemas/learning_material.py` (new)
- `app/api/api.py` (modified - added route)
- `app/models/__init__.py` (modified - added import)
- `migrations/add_learning_materials.py` (new)

**Frontend:**
- `src/services/learningMaterials.service.js` (new)
- `src/components/student/LearningRoadmap.jsx` (new)
- `src/pages/student/ResourcesPage.jsx` (modified - added tab)

## API Endpoints

Base URL: `/api/v1/learning-materials`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate/{subject}` | Generate learning plan |
| GET | `/my-materials` | Get all user's plans |
| GET | `/materials/{id}` | Get specific plan |
| DELETE | `/materials/{id}` | Archive plan |

## Dependencies

**Required:**
- `mistralai` Python package (already in requirements)
- Mistral API key in environment variables
- SQLAlchemy for JSON column type support

**Frontend:**
- Existing components (Card, Badge, Button, Modal)
- React hooks (useState, useEffect)
