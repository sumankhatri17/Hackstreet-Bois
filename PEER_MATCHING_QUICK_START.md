# Peer-to-Peer Matching - Quick Start Integration

## What Was Implemented

A complete peer-to-peer matching system that connects high-scoring students (tutors) with low-scoring students (learners) based on chapter-specific performance using the **Asymmetric Gale-Shapley algorithm**.

## Files Created/Modified

### Backend

**New Files:**
- `backend/app/models/matching.py` - Database models for matches
- `backend/app/services/matching_service.py` - Matching algorithm implementation
- `backend/app/schemas/matching.py` - Pydantic schemas
- `backend/app/api/routes/matching.py` - API endpoints
- `backend/migrations/add_peer_matching.py` - Database migration

**Modified Files:**
- `backend/app/models/__init__.py` - Added matching models
- `backend/app/api/api.py` - Added matching routes
- `backend/app/api/routes/rag_questions.py` - Auto-update performance after evaluation

### Frontend

**New Files:**
- `frontend/src/services/matching.service.js` - API service
- `frontend/src/pages/student/PeerMatchingPage.jsx` - Student matching UI
- `frontend/src/pages/teacher/CreateMatchesPage.jsx` - Teacher matching UI

### Documentation

- `PEER_MATCHING_GUIDE.md` - Complete guide
- `PEER_MATCHING_QUICK_START.md` - This file

## Installation Steps

### 1. Database Migration

Run the migration to create new tables:

```bash
cd backend

# Option 1: If using Alembic
alembic upgrade head

# Option 2: Direct migration (if not using Alembic)
# Connect to your database and run the SQL from the migration file

# Option 3: Use your existing migration system
# Copy the table definitions from backend/migrations/add_peer_matching.py
```

The migration creates 3 tables:
- `student_chapter_performance` - Tracks chapter scores
- `peer_matches` - Stores tutor-learner matches
- `tutoring_sessions` - Records tutoring sessions

### 2. Install Dependencies (if needed)

All required dependencies should already be installed. The system uses:
- SQLAlchemy (already in your project)
- FastAPI (already in your project)
- Standard Python libraries

### 3. Frontend Routes

Add the new pages to your React Router configuration:

```javascript
// In your main routing file (e.g., App.jsx or Router.jsx)
import PeerMatchingPage from './pages/student/PeerMatchingPage';
import CreateMatchesPage from './pages/teacher/CreateMatchesPage';

// Student routes
<Route path="/student/peer-matching" element={<PeerMatchingPage />} />

// Teacher/Admin routes
<Route path="/teacher/create-matches" element={<CreateMatchesPage />} />
<Route path="/admin/create-matches" element={<CreateMatchesPage />} />
```

### 4. Navigation Links

Add navigation links to your UI:

**Student Navigation:**
```jsx
<Link to="/student/peer-matching" className="nav-link">
  <span>👥 Peer Learning</span>
</Link>
```

**Teacher Navigation:**
```jsx
<Link to="/teacher/create-matches" className="nav-link">
  <span>🤝 Create Matches</span>
</Link>
```

### 5. Restart Backend Server

```bash
cd backend
python main.py
# or
uvicorn main:app --reload
```

## How to Use

### For Students:

1. **Complete Assessment** (existing workflow)
2. **Navigate to "Peer Learning"** page
3. **View Your Matches:**
   - "Learning From Others" tab - see tutors who can help you
   - "Teaching Others" tab - see students you can help
4. **Accept or Reject** matches
5. **Mark as Completed** when done

### For Teachers:

1. **Navigate to "Create Matches"** page
2. **Select Subject** (e.g., "maths", "science")
3. **Select Chapter** (e.g., "Real Numbers")
4. **View Statistics** (how many tutors/learners available)
5. **Click "Create Matches"**
6. **Review Results** - see optimal pairings with compatibility scores

### Automatic Integration:

✅ **Already integrated!** Performance data automatically updates after assessment evaluation.

When a student:
1. Submits assessment
2. System evaluates
3. **Automatically extracts chapter performance** ✓
4. Student ready to be matched

## Testing the System

### 1. Create Test Data

Ensure you have students with different performance levels:
- High scorers (≥7/10) will be tutors
- Low scorers (≤5/10) will be learners
- Students with 5-7 scores won't be matched

### 2. Test API Endpoints

```bash
# Check available chapters
curl -X GET http://localhost:8000/api/matching/available-chapters \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get matching stats
curl -X GET http://localhost:8000/api/matching/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create matches (teacher/admin only)
curl -X POST http://localhost:8000/api/matching/create-matches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject": "maths", "chapter": "Real Numbers"}'

# Get my matches (any student)
curl -X GET http://localhost:8000/api/matching/my-matches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Frontend

1. Login as student → Navigate to "Peer Learning"
2. Login as teacher → Navigate to "Create Matches"
3. Create matches for a chapter
4. Login as different students → See their matches

## Algorithm Explained (Simple)

The system matches students like a "dating app" for learning:

1. **Find Tutors** - Students scoring ≥7/10 in a chapter
2. **Find Learners** - Students scoring ≤5/10 in that chapter
3. **Calculate Compatibility** (0-100%):
   - Score gap matters (3-5 points is optimal)
   - Higher tutor score = better
   - Lower learner score = higher priority
4. **Run Gale-Shapley**:
   - Tutors "propose" to best-match learners
   - Learners accept/reject based on current matches
   - Process continues until stable
5. **Create Matches** - Save to database

**Result:** Everyone gets their best possible match!

## Customization

### Adjust Thresholds

In `backend/app/services/matching_service.py`:

```python
AsymmetricGaleShapleyMatcher(
    tutor_threshold=7.0,         # Min score to be tutor (default: 7.0)
    learner_threshold=5.0,       # Max score to need help (default: 5.0)
    max_matches_per_tutor=3,     # Max learners per tutor (default: 3)
    max_matches_per_learner=2,   # Max tutors per learner (default: 2)
)
```

Adjust based on your needs:
- More tutors needed? → Lower `tutor_threshold`
- More matches? → Increase `max_matches_per_*`

### Styling

Both frontend components use Tailwind CSS. Customize colors and styles in:
- `frontend/src/pages/student/PeerMatchingPage.jsx`
- `frontend/src/pages/teacher/CreateMatchesPage.jsx`

## Troubleshooting

### No Matches Created

**Problem:** Teacher clicks "Create Matches" but 0 matches created.

**Solutions:**
- Check if students have completed assessments for that chapter
- Verify score thresholds (maybe all students scored 5-7)
- Lower `tutor_threshold` or raise `learner_threshold`

### Performance Not Updating

**Problem:** Student completed assessment but not appearing in matching.

**Solutions:**
- Check evaluation files exist in `backend/assessments/{user_id}/`
- Manually trigger update: `POST /api/matching/update-performance/{user_id}`
- Check backend logs for errors

### Frontend Not Loading

**Problem:** Pages show blank or error.

**Solutions:**
- Check browser console for errors
- Verify API connection (check network tab)
- Ensure matching routes added to API router
- Check authentication token

## API Reference (Quick)

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/matching/update-performance/{user_id}` | POST | Update chapter performance | Student/Teacher/Admin |
| `/matching/create-matches` | POST | Create new matches | Teacher/Admin |
| `/matching/my-matches` | GET | Get student's matches | Student |
| `/matching/match/{id}/status` | PATCH | Accept/reject match | Student |
| `/matching/available-chapters` | GET | List chapters | Any |
| `/matching/stats` | GET | Get statistics | Any |
| `/matching/student/{id}/performance` | GET | Get performance | Student/Teacher/Admin |

## Next Steps

### Immediate:
1. ✅ Run database migration
2. ✅ Add frontend routes
3. ✅ Add navigation links
4. ✅ Test with real data

### Soon:
- Add email notifications for new matches
- Implement session scheduling
- Add rating/feedback system
- Create progress tracking dashboard

### Later:
- Video conferencing integration
- Automated re-matching after assessments
- Match quality analytics
- Gamification (badges for tutoring)

## Support

For issues or questions:
1. Check `PEER_MATCHING_GUIDE.md` for detailed documentation
2. Check backend logs for errors
3. Test API endpoints directly with curl
4. Verify database tables created correctly

## Architecture Summary

```
Student completes assessment
        ↓
    Evaluation
        ↓
Chapter performance extracted (automatic)
        ↓
Stored in student_chapter_performance table
        ↓
Teacher creates matches
        ↓
Gale-Shapley algorithm runs
        ↓
Optimal matches created
        ↓
Students see matches on Peer Learning page
        ↓
Accept → Connect → Learn!
```

## Success Metrics

Track these to measure success:
- Number of matches created
- Match acceptance rate
- Number of completed tutoring sessions
- Learner score improvement
- Tutor and learner satisfaction ratings

---

**You're all set!** The peer-to-peer matching system is ready to connect your students for collaborative learning. 🎉
