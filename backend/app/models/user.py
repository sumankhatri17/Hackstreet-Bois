"""
User model for students, teachers, and admins
"""
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Foreign Keys
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    school = relationship("School", back_populates="users")
    assessments = relationship("Assessment", back_populates="student")
    progress = relationship("Progress", back_populates="student", uselist=False)
    student_responses = relationship("StudentResponse", back_populates="student")
    
    # Student-specific fields
    current_level = Column(Integer, nullable=True)
    reading_level = Column(Integer, nullable=True)
    writing_level = Column(Integer, nullable=True)
    math_level = Column(Integer, nullable=True)
