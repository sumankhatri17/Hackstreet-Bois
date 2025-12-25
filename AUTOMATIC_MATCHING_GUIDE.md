# Automatic Matching & Help System Guide

## Overview

The enhanced peer matching system now includes **automatic suggestions** and a **student-driven help marketplace**, empowering students to find study partners independently without teacher intervention.

## 🎯 Key Features

### 1. **Automatic Potential Match Suggestions**
- Students see suggested tutors and learners automatically based on their chapter performance
- Uses the same Asymmetric Gale-Shapley compatibility algorithm (0-100% match score)
- Real-time suggestions update as performance changes
- No teacher action required

### 2. **Help Request System**
- Students with low scores can post help requests
- Specify urgency level (low, normal, high, urgent)
- Available tutors receive notifications and can accept
- Automatic matching when tutor accepts

### 3. **Help Offer System**
- High-scoring students can offer tutoring availability
- Set maximum student capacity (1-5)
- Define availability schedule
- Learners can browse and request help

### 4. **Direct Peer Connection**
- Students can connect directly with suggested matches
- One-click connection requests
- Automatic role assignment (tutor/learner) based on scores

---

## 📊 How It Works

### Eligibility Criteria

**To Be a Tutor:**
- Score ≥ 7/10 in the chapter
- High accuracy (above median)

**To Be a Learner:**
- Score ≤ 5/10 in the chapter
- Struggling with the material

### Compatibility Scoring

The system calculates compatibility (0-100%) based on:
- **Score difference** (50%): Larger gap = better match
- **Relative performance** (30%): Tutor in top quartile, learner in bottom quartile
- **Accuracy alignment** (20%): Moderate accuracy difference preferred

---

## 🖥️ Frontend Pages

### 1. Find Help Page (`/dashboard/find-help`)

**Purpose:** Discover potential matches automatically

**Features:**
- Select subject and chapter
- View your current performance score
- See suggested tutors (if you need help)
- See suggested learners (if you can tutor)
- One-click connection with peers
- Compatibility percentage displayed for each match

**User Flow:**
1. Select subject/chapter from dropdown
2. System loads your performance data
3. View automatic suggestions:
   - **"Suggested Tutors for You"** - High scorers who can help you
   - **"Students You Can Help"** - Lower scorers you can tutor
4. Click "Request Help" or "Offer to Help" button
5. Connection created automatically

**UI Components:**
- Performance status card (gradient header)
- Potential match cards (grid layout)
- Subject/chapter selector
- Compatibility score badges
- Real-time loading states

### 2. Help Marketplace Page (`/dashboard/help-marketplace`)

**Purpose:** Browse and manage help requests/offers

**Four Tabs:**

#### Tab 1: Browse Help Requests
- View all open help requests from students
- Filter by subject, chapter, urgency
- See student details and descriptions
- "Accept & Help This Student" button
- Urgency badges (color-coded)

#### Tab 2: Browse Help Offers
- View all active tutor offers
- See tutor availability and capacity
- Check current student count vs max
- "Request Help from This Tutor" button
- Availability indicators (Available/Full)

#### Tab 3: My Requests
- Track your own help requests
- View status: OPEN → IN_PROGRESS → FULFILLED
- See matched tutor information
- Edit or cancel requests

#### Tab 4: My Offers
- Manage your tutoring offers
- Monitor student count (e.g., 2/3 students)
- View active/inactive status
- Update availability or capacity

**Action Buttons:**
- 📚 **Request Help** - Create new help request (form modal)
- 🎓 **Offer Help** - Create new help offer (form modal)

---

## 🔧 API Endpoints

### 1. Get Potential Matches
```http
GET /api/matching/potential-matches?subject={subject}&chapter={chapter}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "student_score": 4.5,
  "can_tutor": false,
  "can_learn": true,
  "potential_tutors": [
    {
      "student_id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "school": "ABC High",
      "score": 9.0,
      "accuracy": 95.5,
      "compatibility_score": 87.5
    }
  ],
  "potential_learners": []
}
```

### 2. Request Help
```http
POST /api/matching/request-help
Authorization: Bearer {token}

{
  "subject": "Mathematics",
  "chapter": "Algebra",
  "description": "Need help with quadratic equations",
  "urgency": "high"
}
```

### 3. Get Help Requests
```http
GET /api/matching/help-requests?subject={subject}&chapter={chapter}&student_id={id}
Authorization: Bearer {token}
```

Use `student_id=me` to get your own requests.

### 4. Offer Help
```http
POST /api/matching/offer-help
Authorization: Bearer {token}

{
  "subject": "Mathematics",
  "chapter": "Algebra",
  "description": "I can explain concepts and solve problems",
  "availability": "Weekdays 4-6 PM",
  "max_students": 3
}
```

### 5. Get Help Offers
```http
GET /api/matching/help-offers?subject={subject}&chapter={chapter}&tutor_id={id}
Authorization: Bearer {token}
```

Use `tutor_id=me` to get your own offers.

### 6. Accept Help Request
```http
POST /api/matching/help-requests/{request_id}/accept
Authorization: Bearer {token}
```

Creates a `PeerMatch` automatically when tutor accepts.

### 7. Connect with Peer
```http
POST /api/matching/connect-with-peer
Authorization: Bearer {token}

{
  "peer_student_id": 123,
  "subject": "Mathematics",
  "chapter": "Algebra"
}
```

**Response:**
```json
{
  "match_id": 456,
  "you_are": "learner",
  "peer_is": "tutor"
}
```

---

## 🗄️ Database Schema

### Help Requests Table
```sql
CREATE TABLE help_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    subject VARCHAR(100),
    chapter VARCHAR(100),
    description TEXT,
    urgency VARCHAR(20) DEFAULT 'normal',  -- low, normal, high, urgent
    status VARCHAR(20) DEFAULT 'open',      -- open, in_progress, fulfilled, cancelled
    matched_with INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Help Offers Table
```sql
CREATE TABLE help_offers (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER REFERENCES users(id),
    subject VARCHAR(100),
    chapter VARCHAR(100),
    description TEXT,
    availability VARCHAR(200),
    max_students INTEGER DEFAULT 3,
    current_students INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Workflow Examples

### Scenario 1: Automatic Suggestion Flow

1. **Student completes assessment**
   - Mistral AI evaluates answers
   - Performance score calculated (e.g., 4/10)

2. **Student visits "Find Help" page**
   - Selects Mathematics → Algebra
   - System determines: `can_learn = true` (score ≤ 5)

3. **System shows suggestions**
   - Lists 3 potential tutors (scores 8-10)
   - Sorted by compatibility (87%, 82%, 78%)

4. **Student clicks "Request Help"**
   - Creates direct connection
   - Match created: Student (learner) ↔ Tutor

### Scenario 2: Help Request Flow

1. **Struggling student posts request**
   - Subject: Science, Chapter: Physics
   - Description: "Need help with Newton's laws"
   - Urgency: High

2. **High-scoring tutor sees request**
   - Browses "Help Marketplace" → "Browse Help Requests"
   - Filters by Science subject
   - Views student details and compatibility

3. **Tutor accepts request**
   - Clicks "Accept & Help This Student"
   - Help request status: OPEN → IN_PROGRESS
   - PeerMatch created automatically

4. **Both students notified**
   - Match appears in "My Matches"
   - Can start tutoring session

### Scenario 3: Help Offer Flow

1. **Top student creates offer**
   - Subject: English, Chapter: Grammar
   - Availability: "Saturdays 2-4 PM"
   - Max students: 3

2. **Learner discovers offer**
   - Browses "Browse Help Offers"
   - Sees tutor's description and availability
   - Checks capacity: 1/3 students

3. **Learner requests help**
   - Clicks "Request Help from This Tutor"
   - Direct message sent to tutor

4. **Tutor accepts (via help requests)**
   - Offer capacity updates: 2/3 students
   - Match created

---

## 🎨 UI/UX Highlights

### Color-Coded Elements

**Urgency Badges:**
- 🟢 Low: Green
- 🔵 Normal: Blue
- 🟠 High: Orange
- 🔴 Urgent: Red

**Status Badges:**
- 🟢 Open: Green
- 🔵 In Progress: Blue
- ⚫ Fulfilled: Gray
- 🔴 Cancelled: Red

**Score Colors:**
- 🟢 ≥7: Green (can tutor)
- 🟡 5-7: Yellow (intermediate)
- 🔴 ≤5: Red (needs help)

### Responsive Design
- Grid layout: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Sticky navigation tabs
- Modal forms for actions
- Loading spinners for async operations

---

## 🔐 Security & Privacy

1. **Authentication Required**
   - All endpoints require JWT Bearer token
   - Users can only view matches for their class/grade

2. **Data Privacy**
   - Students only see first name + last initial
   - Email addresses visible only after match acceptance
   - School information optional

3. **Rate Limiting**
   - Max 5 help requests per day per student
   - Max 3 active help offers per tutor
   - Prevents spam and abuse

---

## 📈 Analytics & Monitoring

### Track These Metrics:
- **Automatic Match Success Rate**: % of suggested matches that connect
- **Help Request Response Time**: Time from post to acceptance
- **Tutor Utilization**: Average students per offer
- **Popular Subjects/Chapters**: Most requested help topics
- **Urgency Distribution**: Low/Normal/High/Urgent breakdown

### Admin Dashboard (Future):
- View all help requests/offers
- Monitor matching efficiency
- Identify struggling chapters
- Promote top tutors

---

## 🚀 Deployment Checklist

### Backend:
- [x] Database migration applied (`add_peer_matching.py`)
- [x] Models created (HelpRequest, HelpOffer)
- [x] Service methods implemented (get_potential_tutors/learners)
- [x] API endpoints added (7 new routes)
- [x] Schemas validated (Pydantic models)

### Frontend:
- [x] FindHelpPage component created
- [x] HelpMarketplacePage component created
- [x] Routes added to App.jsx
- [x] Sidebar navigation updated
- [x] API service methods added

### Testing:
- [ ] Unit tests for matching service
- [ ] Integration tests for help system
- [ ] E2E tests for student flow
- [ ] Load testing for suggestions endpoint

### Documentation:
- [x] API documentation
- [x] User guide
- [x] Database schema
- [x] Workflow diagrams

---

## 🛠️ Troubleshooting

### Issue: No Suggestions Shown

**Possible Causes:**
1. Student score is intermediate (5-7) → Not eligible for matches
2. No other students have taken the assessment yet
3. All potential matches already connected

**Solution:**
- Check `student_chapter_performance` table for data
- Verify threshold settings (tutor_threshold=7, learner_threshold=5)
- Encourage more students to complete assessments

### Issue: Help Request Not Appearing

**Possible Causes:**
1. Status filter excluding it (only showing OPEN)
2. Subject/chapter mismatch
3. Request already fulfilled

**Solution:**
- Clear filters and reload
- Check help_requests table directly
- Verify request status

### Issue: Can't Accept Help Request

**Possible Causes:**
1. User not eligible to tutor (score < 7)
2. Request already matched
3. Concurrent acceptance conflict

**Solution:**
- Check user's score in the chapter
- Refresh page to see updated status
- Implement optimistic locking if needed

---

## 🔮 Future Enhancements

1. **Real-Time Notifications**
   - WebSocket integration for instant alerts
   - Push notifications for new requests/offers

2. **Smart Scheduling**
   - Integrate calendar API
   - Suggest optimal meeting times
   - Automated reminders

3. **Gamification**
   - Badges for top tutors
   - Points for helping others
   - Leaderboards

4. **Video Chat Integration**
   - Embedded video calls
   - Screen sharing for problem-solving
   - Recording sessions (with consent)

5. **Advanced Matching**
   - Learning style compatibility
   - Time zone matching
   - Language preferences

6. **Feedback System**
   - Rate tutoring sessions
   - Leave reviews
   - Improve future suggestions

---

## 📞 Support

For questions or issues:
- Check [PEER_MATCHING_GUIDE.md](./PEER_MATCHING_GUIDE.md) for algorithm details
- Review [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md) for API specifics
- Contact development team

---

**Last Updated:** December 2024  
**Version:** 2.0 (Automatic Matching & Help System)
