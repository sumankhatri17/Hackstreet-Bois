"""
Seed database with sample data for development/testing
"""
from app.core.security import get_password_hash
from app.db.database import SessionLocal
from app.models.assessment import DifficultyLevel, Question, QuestionType
from app.models.school import School
from app.models.user import User, UserRole
from sqlalchemy.orm import Session


def seed_schools(db: Session):
    """Create sample schools"""
    schools = [
        School(
            name="Lincoln Elementary School",
            address="123 Main St",
            city="Springfield",
            state="IL",
            zip_code="62701",
            phone="555-0100",
            email="info@lincoln.edu",
            principal_name="Dr. Sarah Johnson"
        ),
        School(
            name="Washington High School",
            address="456 Oak Ave",
            city="Chicago",
            state="IL",
            zip_code="60601",
            phone="555-0200",
            email="info@washington.edu",
            principal_name="Mr. Michael Chen"
        )
    ]
    
    for school in schools:
        db.add(school)
    db.commit()
    print(f"✓ Created {len(schools)} schools")


def seed_users(db: Session):
    """Create sample users"""
    # bcrypt has a 72 byte limit, so use shorter passwords
    users = [
        User(
            email="admin@eduassess.com",
            name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        ),
        User(
            email="teacher@eduassess.com",
            name="Jane Teacher",
            hashed_password=get_password_hash("teacher123"),
            role=UserRole.TEACHER,
            school_id=1,
            is_active=True
        ),
        User(
            email="student@eduassess.com",
            name="John Student",
            hashed_password=get_password_hash("student123"),
            role=UserRole.STUDENT,
            school_id=1,
            current_level=5,
            reading_level=6,
            writing_level=5,
            math_level=4,
            is_active=True
        ),
    ]
    
    for user in users:
        db.add(user)
    db.commit()
    print(f"✓ Created {len(users)} users")


def seed_questions(db: Session):
    """Create sample questions"""
    questions = [
        # Math Questions - Grade 3
        Question(
            subject="Math",
            topic="Addition",
            difficulty=DifficultyLevel.BEGINNER,
            question_type=QuestionType.MULTIPLE_CHOICE,
            grade_level=3,
            question_text="What is 15 + 27?",
            options=["32", "42", "52", "62"],
            correct_answer="42",
            explanation="15 + 27 = 42",
            points=1
        ),
        Question(
            subject="Math",
            topic="Multiplication",
            difficulty=DifficultyLevel.INTERMEDIATE,
            question_type=QuestionType.MULTIPLE_CHOICE,
            grade_level=3,
            question_text="What is 8 × 7?",
            options=["54", "56", "64", "72"],
            correct_answer="56",
            explanation="8 × 7 = 56",
            points=1
        ),
        
        # Reading Questions - Grade 4
        Question(
            subject="Reading",
            topic="Vocabulary",
            difficulty=DifficultyLevel.BEGINNER,
            question_type=QuestionType.MULTIPLE_CHOICE,
            grade_level=4,
            question_text="What does 'enormous' mean?",
            options=["Very small", "Very large", "Very fast", "Very slow"],
            correct_answer="Very large",
            explanation="Enormous means extremely large or huge.",
            points=1
        ),
        Question(
            subject="Reading",
            topic="Comprehension",
            difficulty=DifficultyLevel.INTERMEDIATE,
            question_type=QuestionType.SHORT_ANSWER,
            grade_level=4,
            question_text="What is the main idea of a paragraph?",
            correct_answer="the most important point",
            explanation="The main idea is the central or most important point in a paragraph.",
            points=2
        ),
        
        # Science Questions - Grade 5
        Question(
            subject="Science",
            topic="Biology",
            difficulty=DifficultyLevel.INTERMEDIATE,
            question_type=QuestionType.MULTIPLE_CHOICE,
            grade_level=5,
            question_text="What is the process by which plants make food?",
            options=["Respiration", "Photosynthesis", "Digestion", "Reproduction"],
            correct_answer="Photosynthesis",
            explanation="Plants use photosynthesis to convert sunlight into energy.",
            points=1
        ),
        Question(
            subject="Science",
            topic="Earth Science",
            difficulty=DifficultyLevel.BEGINNER,
            question_type=QuestionType.TRUE_FALSE,
            grade_level=5,
            question_text="The Earth revolves around the Sun.",
            correct_answer="true",
            explanation="The Earth takes approximately 365 days to revolve around the Sun.",
            points=1
        ),
    ]
    
    for question in questions:
        db.add(question)
    db.commit()
    print(f"✓ Created {len(questions)} sample questions")


def seed_database():
    """Seed the database with sample data"""
    db = SessionLocal()
    
    try:
        print("\n🌱 Seeding database...")
        
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("⚠️  Database already contains data. Skipping seed.")
            return
        
        seed_schools(db)
        seed_users(db)
        seed_questions(db)
        
        print("\n✅ Database seeding completed successfully!")
        print("\nSample credentials:")
        print("  Admin:   admin@eduassess.com / admin123")
        print("  Teacher: teacher@eduassess.com / teacher123")
        print("  Student: student@eduassess.com / student123")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
