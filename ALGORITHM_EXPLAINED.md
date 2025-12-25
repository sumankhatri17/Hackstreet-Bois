# Asymmetric Gale-Shapley Algorithm Explained

## What is it?

The **Gale-Shapley algorithm** (also called the "Stable Marriage Problem" algorithm) finds stable matches between two groups. We use an **asymmetric** version where one side (tutors) proposes and the other (learners) accepts/rejects.

## Why This Algorithm?

✅ **Guaranteed to work** - Always finds a solution  
✅ **Optimal matches** - Best possible for tutors  
✅ **Stable** - No pair prefers each other over current matches  
✅ **Fair** - Based on objective compatibility scores  
✅ **Proven** - Nobel Prize-winning algorithm (2012)

## How It Works (Simple Example)

### Setup

**Tutors (High Scorers):**
- Alice: 9/10 in "Real Numbers"
- Bob: 8/10 in "Real Numbers"

**Learners (Low Scorers):**
- David: 3/10 in "Real Numbers"
- Emma: 4/10 in "Real Numbers"

### Step 1: Calculate Compatibility

For each tutor-learner pair, calculate a compatibility score:

```
Alice → David: 95% (excellent gap, high expertise)
Alice → Emma:  88% (good gap, high expertise)
Bob → David:   88% (good gap, good expertise)
Bob → Emma:    82% (okay gap, good expertise)
```

### Step 2: Build Preference Lists

**Alice's preferences:**
1. David (95%)
2. Emma (88%)

**Bob's preferences:**
1. David (88%)
2. Emma (82%)

**David's preferences:**
1. Alice (95%)
2. Bob (88%)

**Emma's preferences:**
1. Alice (88%)
2. Bob (82%)

### Step 3: Run Algorithm

**Round 1:**
- Alice proposes to David → David accepts (first proposal)
- Bob proposes to David → David compares:
  - Current: Alice (95%)
  - New: Bob (88%)
  - Decision: Keep Alice, reject Bob

**Round 2:**
- Bob proposes to Emma → Emma accepts (first proposal)

**Result: Stable!**
- Match 1: Alice ↔ David (95% compatibility)
- Match 2: Bob ↔ Emma (82% compatibility)

## Why Is This "Stable"?

A matching is **unstable** if:
- Two people prefer each other over their current matches
- They would both want to "break up" and match together instead

Our result is **stable** because:
- Alice has David (her #1 choice) ✓
- Bob has Emma (his only remaining choice) ✓
- David has Alice (his #1 choice) ✓
- Emma has Bob (her only match) ✓

No pair wants to switch!

## Real-World Example with More Students

### Input
```
Tutors (score ≥ 7):
- Alice (9), Bob (8), Charlie (7), Diana (7)

Learners (score ≤ 5):
- Emma (3), Frank (4), Grace (4), Henry (5), Iris (5)
```

### Compatibility Matrix
```
         Emma  Frank  Grace  Henry  Iris
Alice     95    90     90     85     85
Bob       88    85     85     80     80
Charlie   78    75     75     70     70
Diana     78    75     75     70     70
```

### Algorithm Runs...
```
Round 1:
- Alice → Emma (accepts)
- Bob → Frank (accepts)
- Charlie → Grace (accepts)
- Diana → Henry (accepts)
- Iris: No match yet

Round 2:
- Alice → Iris (2nd match, capacity allows)
- Iris: Accepts Alice

Final Matches:
1. Alice ↔ Emma (95%)
2. Alice ↔ Iris (85%)
3. Bob ↔ Frank (85%)
4. Charlie ↔ Grace (75%)
5. Diana ↔ Henry (70%)
```

Note: Alice gets 2 learners (within tutor capacity of 3)

## Key Features in Our Implementation

### 1. Capacity Limits
```python
max_matches_per_tutor = 3    # Each tutor can help 3 learners
max_matches_per_learner = 2  # Each learner can have 2 tutors
```

### 2. Compatibility Scoring

```python
def calculate_compatibility(tutor_score, learner_score):
    gap = tutor_score - learner_score
    
    # Optimal gap: 3-5 points
    if gap < 2:
        gap_score = gap * 10  # Too small
    elif gap <= 5:
        gap_score = 20 + (gap - 2) * 20  # Optimal
    else:
        gap_score = 80 - (gap - 5) * 10  # Too large
    
    # Add expertise and need factors
    expertise = (tutor_score / 10) * 30
    need = ((10 - learner_score) / 10) * 20
    
    return (gap_score * 0.5) + expertise + need
```

### 3. Thresholds
```python
tutor_threshold = 7.0   # Must score at least 7/10
learner_threshold = 5.0 # Must score at most 5/10
```

Students between 5-7 are not matched (not strong enough to teach, not weak enough to need help).

## Visual Representation

```
Before Matching:
╔════════════╗     ╔════════════╗
║  Tutors    ║     ║  Learners  ║
║  (≥7/10)   ║     ║  (≤5/10)   ║
╠════════════╣     ╠════════════╣
║ Alice (9)  ║     ║ David (3)  ║
║ Bob (8)    ║     ║ Emma (4)   ║
║ Charlie (7)║     ║ Frank (5)  ║
╚════════════╝     ╚════════════╝

After Gale-Shapley:
╔════════════╗     ╔════════════╗
║ Alice (9)  ║════►║ David (3)  ║  95%
║            ║════►║ Frank (5)  ║  88%
╠════════════╣     ╠════════════╣
║ Bob (8)    ║════►║ Emma (4)   ║  85%
╠════════════╣     ╚════════════╝
║ Charlie (7)║ (no match)
╚════════════╝
```

## Why "Asymmetric"?

**Traditional Gale-Shapley** (symmetric):
- Both sides have equal power
- Both can propose
- Used for: College admissions, medical residency matching

**Asymmetric Gale-Shapley** (our version):
- One side proposes (tutors)
- Other side receives (learners)
- Result is "tutor-optimal" (tutors get their best possible matches)
- Used for: Mentorship programs, tutoring systems, job matching

## Mathematical Properties

### Theorem 1: Existence
**There always exists a stable matching.**
- Proof: The algorithm always terminates with a valid matching

### Theorem 2: Optimality
**The result is tutor-optimal.**
- Each tutor gets the best learner(s) they can possibly get in any stable matching
- Learners get the worst tutors they would get in any stable matching
  
### Theorem 3: Uniqueness
**If all preferences are strict, there's at most one stable matching per execution.**
- Our compatibility scores ensure strict preferences

### Theorem 4: Complexity
**Time complexity: O(n²)**
- Where n = max(number of tutors, number of learners)
- In practice, much faster due to capacity limits

## Real Implementation Benefits

### For Students (Learners):
- Get matched with high-performing peers
- Multiple tutors possible (up to 2)
- Can accept/reject matches
- See compatibility scores

### For Students (Tutors):
- Help peers and reinforce own learning
- Multiple learners (up to 3)
- See who needs help most
- Track impact

### For Teachers:
- One-click matching
- Optimal pairings automatically
- See compatibility scores
- Monitor all matches

### For the System:
- Fair distribution
- No "blocking pairs" (instabilities)
- Scalable to many students
- Mathematically proven to work

## Comparison with Alternatives

### Random Matching
❌ Not optimal  
❌ May create bad pairs  
❌ No stability guarantee  

### Greedy (Highest score tutors to lowest score learners)
❌ Not stable  
❌ Doesn't consider preferences  
❌ May miss better combinations  

### Gale-Shapley (Our Choice)
✅ Optimal  
✅ Stable  
✅ Proven algorithm  
✅ Considers all factors  

## Fun Fact

Lloyd Shapley and Alvin Roth won the **2012 Nobel Prize in Economics** for this algorithm and its applications to:
- Medical residency matching (USA)
- School choice programs
- Kidney exchange programs
- And now... **student peer tutoring!** 🎉

## Resources

- [Wikipedia: Stable Marriage Problem](https://en.wikipedia.org/wiki/Stable_marriage_problem)
- [Nobel Prize Summary](https://www.nobelprize.org/prizes/economic-sciences/2012/summary/)
- Original Paper: Gale, D. and Shapley, L.S. (1962)

---

**In Summary:** The Asymmetric Gale-Shapley algorithm gives us a mathematically proven, optimal way to match students for peer-to-peer learning. It's not just "pretty good" — it's **provably the best possible matching** given our compatibility criteria! 🧮✨
