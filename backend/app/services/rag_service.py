"""
RAG Service for question generation using Mistral AI
"""
import json
import os
import re
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import random
import faiss
import numpy as np
from mistralai import Mistral


class RAGService:
    """Service to generate questions using RAG and Mistral AI"""
    
    def __init__(self, api_key: str, data_folder: str):
        """
        Initialize RAG service
        
        Args:
            api_key: Mistral AI API key
            data_folder: Path to folder containing data files
        """
        self.client = Mistral(api_key=api_key)
        self.data_folder = Path(data_folder)
        self.embed_model = "mistral-embed"
        self.chat_model = "mistral-large-latest"
        self.chunk_size = 2048
        self.chunk_overlap = 200
        self.batch_size = 32
        
        # Storage for loaded data
        self.all_objects = []
        self.per_file_objects = {}
        self.all_chunks = []
        self.index = None
        self.metadata_list = []
        
    def load_data_files(self):
        """Load all JSONL files from data folder"""
        self.all_objects = []
        self.per_file_objects = {}
        
        if not self.data_folder.exists():
            raise FileNotFoundError(f"Data folder not found: {self.data_folder}")
        
        for file_path in self.data_folder.glob("*.jsonl"):
            filename = file_path.name
            objs = []
            
            with open(file_path, "r", encoding="utf-8") as f:
                for line_no, line in enumerate(f, start=1):
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                        objs.append(obj)
                        self.all_objects.append(obj)
                    except json.JSONDecodeError:
                        print(f"Warning: skipping invalid JSON in {filename} at line {line_no}")
            
            self.per_file_objects[filename] = objs
        
        print(f"Loaded {len(self.all_objects)} objects from {len(self.per_file_objects)} files")
    
    def load_structured_json_files(self):
        """Load structured JSON files (like mathsclass10.json) containing chapters and questions"""
        structured_data = {}
        
        for file_path in self.data_folder.glob("*.json"):
            filename = file_path.name
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                # Extract subject from filename (e.g., "mathsclass10.json" -> "maths")
                subject = file_path.stem.replace("class10", "").replace("class9", "")
                structured_data[subject] = data
                
            except Exception as e:
                print(f"Error loading {filename}: {e}")
        
        return structured_data
    
    @staticmethod
    def split_into_sentences(text: str) -> List[str]:
        """Split text into sentences"""
        _SENT_SPLIT_RE = re.compile(r'(?<=[\.\?\!])\s+')
        parts = _SENT_SPLIT_RE.split(text.strip())
        return [p.strip() for p in parts if p.strip()]
    
    def chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks"""
        if not text:
            return []
        
        text = text.strip()
        if len(text) <= self.chunk_size:
            return [text]
        
        sentences = self.split_into_sentences(text)
        chunks = []
        current = []
        current_len = 0
        
        for sent in sentences:
            s_len = len(sent) + 1
            if current_len + s_len <= self.chunk_size or not current:
                current.append(sent)
                current_len += s_len
            else:
                chunks.append(" ".join(current).strip())
                
                # Add overlap
                if self.chunk_overlap > 0:
                    overlap_chars = 0
                    overlap_sents = []
                    for prev_sent in reversed(current):
                        overlap_chars += len(prev_sent) + 1
                        overlap_sents.insert(0, prev_sent)
                        if overlap_chars >= self.chunk_overlap:
                            break
                    current = overlap_sents.copy()
                    current_len = sum(len(x) + 1 for x in current)
                else:
                    current = []
                    current_len = 0
                
                if not current:
                    current.append(sent)
                    current_len = s_len
                elif current_len + s_len <= self.chunk_size:
                    current.append(sent)
                    current_len += s_len
        
        if current:
            chunks.append(" ".join(current).strip())
        
        return chunks
    
    def create_chunks_from_objects(self):
        """Create text chunks from loaded objects"""
        self.all_chunks = []
        
        for obj in self.all_objects:
            text = obj.get("text", "") or obj.get("content", "") or ""
            if not isinstance(text, str) or not text.strip():
                continue
            
            src_id = obj.get("id")
            src_file = obj.get("file")
            section = obj.get("section_label")
            
            chunk_texts = self.chunk_text(text)
            
            for idx, ctext in enumerate(chunk_texts):
                chunk_doc = {
                    "chunk_id": str(uuid.uuid4()),
                    "source_id": src_id,
                    "source_file": src_file,
                    "section_label": section,
                    "chunk_index": idx,
                    "text": ctext,
                    "orig_length": len(text),
                }
                self.all_chunks.append(chunk_doc)
        
        print(f"Created {len(self.all_chunks)} chunks")
    
    def generate_embeddings(self) -> Tuple[np.ndarray, List[Dict[str, Any]]]:
        """Generate embeddings for all chunks"""
        if not self.all_chunks:
            return np.zeros((0, 0), dtype=np.float32), []
        
        texts = [c.get("text", "") for c in self.all_chunks]
        embeddings_list = []
        metadata_list = []
        
        total = len(texts)
        print(f"Embedding {total} chunks in batches of {self.batch_size}...")
        
        for start in range(0, total, self.batch_size):
            end = min(start + self.batch_size, total)
            batch_texts = texts[start:end]
            
            try:
                resp = self.client.embeddings.create(
                    model=self.embed_model,
                    inputs=batch_texts
                )
                
                data_items = resp.data if hasattr(resp, 'data') else resp.get("data")
                
                for item in data_items:
                    emb = item.embedding if hasattr(item, 'embedding') else item.get("embedding")
                    embeddings_list.append(emb)
                
                print(f"  Embedded {end}/{total}")
                
            except Exception as e:
                print(f"Error embedding batch {start}-{end}: {e}")
                raise
        
        # Create metadata
        for i, chunk in enumerate(self.all_chunks):
            meta = {
                "embedding_index": i,
                "chunk_id": chunk.get("chunk_id"),
                "source_id": chunk.get("source_id"),
                "source_file": chunk.get("source_file"),
                "section_label": chunk.get("section_label"),
                "chunk_index": chunk.get("chunk_index"),
                "orig_length": chunk.get("orig_length"),
            }
            metadata_list.append(meta)
        
        embeddings_array = np.array(embeddings_list, dtype=np.float32)
        return embeddings_array, metadata_list
    
    def build_faiss_index(self, embeddings: np.ndarray, use_l2: bool = True):
        """Build FAISS index from embeddings"""
        n, d = embeddings.shape
        
        if use_l2:
            self.index = faiss.IndexFlatL2(d)
        else:
            self.index = faiss.IndexFlatIP(d)
        
        self.index.add(embeddings)
        print(f"FAISS index built with {self.index.ntotal} vectors of dimension {d}")
    
    def retrieve_context(self, question: str, k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve top-k relevant chunks for a question"""
        if self.index is None:
            raise RuntimeError("FAISS index not built. Call build_faiss_index first.")
        
        # Generate query embedding
        resp = self.client.embeddings.create(
            model=self.embed_model,
            inputs=[question]
        )
        
        data_items = resp.data if hasattr(resp, 'data') else resp.get("data")
        first_item = data_items[0]
        q_emb = first_item.embedding if hasattr(first_item, 'embedding') else first_item.get("embedding")
        
        qvec = np.array([q_emb], dtype=np.float32)
        
        # Search index
        distances, indices = self.index.search(qvec, k)
        
        # Build results
        retrieved = []
        for i, (idx, dist) in enumerate(zip(indices[0], distances[0])):
            if idx < 0 or idx >= len(self.all_chunks):
                continue
            
            chunk = self.all_chunks[idx]
            retrieved.append({
                "index": int(idx),
                "score": float(dist),
                "text": chunk.get("text", ""),
                "metadata": self.metadata_list[idx] if idx < len(self.metadata_list) else {}
            })
        
        return retrieved
    
    def generate_answer(self, question: str, context: str) -> str:
        """Generate answer using Mistral chat model"""
        prompt = (
            "You are a helpful educational assistant. Use ONLY the context provided below to answer the question. "
            "Do not use any outside knowledge beyond the context. If the answer is not contained in the context, say you don't know.\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {question}\n\nAnswer:"
        )
        
        messages = [{"role": "user", "content": prompt}]
        
        try:
            chat_response = self.client.chat.complete(
                model=self.chat_model,
                messages=messages
            )
            
            answer = chat_response.choices[0].message.content
            return answer
            
        except Exception as e:
            print(f"Error generating answer: {e}")
            raise
    
    def generate_questions_from_chapter(
        self, 
        chapter_name: str, 
        subject: str = None,
        num_questions: int = 5,
        difficulty: str = "medium"
    ) -> List[Dict[str, Any]]:
        """
        Generate questions for a specific chapter using RAG
        
        Args:
            chapter_name: Name of the chapter
            subject: Subject name (optional, helps narrow down context)
            num_questions: Number of questions to generate
            difficulty: Difficulty level (easy, medium, hard)
        
        Returns:
            List of generated questions with metadata
        """
        # First, try to find existing questions from structured data
        structured_data = self.load_structured_json_files()
        
        # Look for matching chapter in structured data
        for subj, chapters in structured_data.items():
            if subject and subj.lower() != subject.lower():
                continue
            
            for chapter_data in chapters:
                if chapter_data.get("chapter", "").lower() == chapter_name.lower():
                    # Found matching chapter, return existing questions
                    questions = chapter_data.get("questions", [])
                    
                    # Format as question objects
                    formatted_questions = []
                    for i, q_text in enumerate(questions[:num_questions]):
                        formatted_questions.append({
                            "id": str(uuid.uuid4()),
                            "question": q_text,
                            "chapter": chapter_name,
                            "subject": subj,
                            "type": "text",
                            "difficulty": difficulty,
                            "order": i + 1
                        })
                    
                    return formatted_questions
        
        # If no structured data found, generate using RAG
        return self._generate_questions_with_rag(chapter_name, subject, num_questions, difficulty)
    
    def generate_questions_by_subject(self, subject: str, questions_per_chapter: int = 1) -> List[Dict[str, Any]]:
        """Generate questions from all chapters in a subject (5 questions per chapter)"""
        
        # Get all chapters for the subject
        all_chapters = {
            "maths": [
                "Real Numbers", "Polynomials", "Linear Equations", "Quadratic Equations",
                "Arithmetic Progressions", "Triangles", "Coordinate Geometry", 
                "Trigonometry", "Circles", "Statistics", "Probability"
            ],
            "science": [
                "Chemical Reactions", "Acids Bases and Salts", "Metals and Non-metals",
                "Carbon Compounds", "Periodic Classification", "Life Processes",
                "Control and Coordination", "Reproduction", "Heredity and Evolution",
                "Light Reflection and Refraction", "Human Eye", "Electricity",
                "Magnetic Effects of Current"
            ],
            "english": [
                "Reading Comprehension", "Grammar", "Writing Skills", "Literature",
                "Poetry Analysis", "Essay Writing", "Letter Writing"
            ]
        }
        
        chapters = all_chapters.get(subject.lower(), [])
        
        if not chapters:
            raise ValueError(f"No chapters found for subject: {subject}")
        
        # Generate ALL questions in one API call for efficiency
        chapters_text = "\n".join([f"- {ch}" for ch in chapters])
        grade = 10
        random_seed =  random.randint(1, 100)
        system_msg = (
            f"You are an expert academic question generator.\n\n"
            f"Subject: {subject}\n"
            f"Grade Level: {grade if 'grade' in locals() else '10'}\n"
            f"Chapters to generate questions from:\n"
            f"{chapters_text}\n\n"
            f"Instructions:\n"
            f"1️⃣ Generate exactly {questions_per_chapter} HIGH-QUALITY educational questions for EACH chapter listed.\n"
            f"2️⃣ Do NOT add or remove chapters — only use the chapters provided above.\n"
            f"3️⃣ Ensure questions are clear, specific, and appropriate for Grade {grade if 'grade' in locals() else '9'} learning outcomes.\n\n"
            f"- Do NOT ask Long questions, ask questions that can be answered in 1-2 sentences"
            f"This in the Context of Nepal, Provide Difficulty level suitable for Nepal"

            
        )

            
        user_prompt = (
            f"⚠ Special Rule for English:\n"
            f"- Do NOT use Retrieval-Augmented content or any provided text passages.\n"
            f"- Use the model’s own cognition and prior knowledge.\n"
            f"- ONLY derive question topics based on the chapter titles themselves.\n"
            f"- English questions should be conceptual,context-independent.\n\n"
            f"- Correct the following sentence and explain the grammatical rule applied: Dont ask questions like this and even if you ask provide complete question"
            f"- Do NOT ask Long questions, ask questions that can be answered in 1-2 sentences"
            f"- Make sure the questions are Complete, Provide something that can be answered "
            f"- Only as 2 questions from any chapters that are needed to be answered in a descriptive way,other than that, ask Grammatical questions "
            f"This in the Context of Nepal, Provide Difficulty level suitable for Nepal"
            
            f"⚠ Special Rule for Maths:\n"
            f"Do NOT ask Proving questions, Ask questions That are asked in SATS, That can be answerable with a single sentence or  Numeric values"
            f"This in the Context of Nepal, Provide Difficulty level suitable for Nepal"
            f"- Make sure the questions are Complete, Provide something that can be answered "
            f"- Dont Provide only this -Solve the system of equations :- also provide the inequality or equations that are needed to be solved"
            
            f"⚠ Special Rule for Science:\n"
            f"Do NOT ask Proving questions, Ask questions  That can be answerable with a few sentences or Numeric values"
            f"This in the Context of Nepal, Provide Difficulty level suitable for Nepal"
            f"- Make sure the questions are Complete, Provide something that can be answered "
            

            f"Formatting Requirements (follow EXACTLY):\n"
            f"### **Chapter: [Exact Chapter Name]**\n"
            f"**Q1:** [Question]\n"
            f"**Q2:** [Question]\n"
            f"... Continue until Q{questions_per_chapter}\n\n"
            f"Repeat this format for every chapter.\n"

            f" NO answers. NO explanations. NO additional text.\n"
            f"Do not hallucinate or modify chapter names.\n"
            f"Start writing questions now (seed: {random_seed}):"
            )
        messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_prompt}
            ]
        
        try:
            print(f"Generating questions for all {len(chapters)} chapters in {subject}...")
            
            chat_response = self.client.chat.complete(
                model=self.chat_model,
                messages=messages,
                temperature=0.8,  # Higher temperature for more variation
                max_tokens=8000  # Increased to prevent incomplete questions
            )
            
            answer = chat_response.choices[0].message.content
            
            # Clean up any LaTeX formatting that might have slipped through
            answer = self._clean_latex_formatting(answer)
            
            # Debug: Print first 500 chars of response
            print(f"AI Response preview: {answer[:500]}...")
            
            # Parse questions by chapter
            all_questions = []
            current_chapter = None
            
            lines = answer.strip().split("\n")
            for line in lines:
                line = line.strip()
                if not line or line.startswith("---"):
                    continue
                
                # Check if this is a chapter header - must have "Chapter:" in it
                # Remove markdown first to check the actual text
                clean_line = line.replace("###", "").replace("**", "").strip()
                
                if "chapter:" in clean_line.lower() and not clean_line.lower().startswith("q"):
                    # Extract chapter name after "Chapter:"
                    current_chapter = clean_line.split(":", 1)[1].strip()
                    print(f"Found chapter: {current_chapter}")
                    continue
                
                # Check if this looks like a question - starts with **Q followed by digit
                if current_chapter and "**Q" in line and ":" in line:
                    # Remove markdown and question numbering
                    clean_question = line.replace("**", "").strip()
                    # Remove Q1:, Q2:, etc.
                    question_text = re.sub(r'^Q\d+:\s*', '', clean_question, flags=re.IGNORECASE)
                    question_text = question_text.strip()
                    
                    # Only add if it's actually a question (not empty and reasonable length)
                    if question_text and len(question_text) > 15:
                        all_questions.append({
                            "id": str(uuid.uuid4()),
                            "question": question_text,
                            "chapter": current_chapter,
                            "subject": subject,
                            "type": "text",
                            "order": len(all_questions) + 1
                        })
            
            print(f"Generated {len(all_questions)} questions total")
            return all_questions
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            raise
    
    def _generate_questions_with_rag(
        self, 
        chapter_name: str,
        subject: str,
        num_questions: int,
        difficulty: str
    ) -> List[Dict[str, Any]]:
        """Generate questions using Mistral AI chatbot with a prompt"""
        
        import random
        import time

        # Add random seed based on time for variation
        random_seed = int(time.time() * 1000) % 10000
        
        # Build hardcoded, structured prompt based on subject
        # Use system + user messages for stronger instruction
        if subject and subject.lower() == "english":
            system_msg = (
                "You are a question writer. You write complete, specific questions for students. "
                "You NEVER write labels like '*Inference-Based Question*' or '*Error Correction*'. "
                "You ONLY write actual questions with specific details."
            )
            
            user_prompt = (
                f"Write {num_questions} complete English questions about '{chapter_name}'. "
                f"Each question must have specific details.\n\n"
                f"Examples:\n"
                f"- Rewrite in passive voice: 'The dog chased the cat.'\n"
                f"- Correct: 'She don't like pizza.'\n"
                f"- Identify the metaphor: 'Time is a thief.'\n\n"
                f"Format:\n"
                f"Q1: [Actual complete question]\n"
                f"Q2: [Actual complete question]\n\n"
                f"Difficulty: {difficulty} | Seed: {random_seed}\n"
                f"Start now:"
            )
            messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_prompt}
            ]
        elif subject and subject.lower() == "maths":
            system_msg = (
                "You are a math question writer. You write complete math questions in plain text. "
                "You NEVER write labels like '*Algebra Question*'. "
                "You NEVER use LaTeX. You ONLY write actual questions with numbers and plain text math."
            )
            
            user_prompt = (
                f"Write {num_questions} complete math questions about '{chapter_name}'. "
                f"Use plain text: sqrt(x), x^2, (a+b)/c format.\n\n"
                f"Examples:\n"
                f"- Solve for x: x^2 + 5x + 6 = 0\n"
                f"- Find sqrt(144) + sqrt(81)\n"
                f"- Simplify: (3x + 2)(2x - 5)\n\n"
                f"Format:\n"
                f"Q1: [Actual complete question]\n"
                f"Q2: [Actual complete question]\n\n"
                f"Difficulty: {difficulty} | Seed: {random_seed}\n"
                f"Start now:"
            )
            messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_prompt}
            ]
        else:
            # Default prompt for other subjects
            system_msg = "You are a question writer. You write complete, specific questions. Never write labels or categories."
            
            user_prompt = (
                f"Write {num_questions} complete questions about '{chapter_name}' in {subject}.\n\n"
                f"Format:\n"
                f"Q1: [Complete question]\n"
                f"Q2: [Complete question]\n\n"
                f"Difficulty: {difficulty} | Seed: {random_seed}\n"
                f"Start now:"
            )
            messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_prompt}
            ]
        
        try:
            chat_response = self.client.chat.complete(
                model=self.chat_model,
                messages=messages,
                temperature=0.8,  # Higher temperature for more variation
                max_tokens=4000  # Increased to prevent incomplete questions
            )
            
            answer = chat_response.choices[0].message.content
            
            # Clean up any LaTeX formatting that might have slipped through
            answer = self._clean_latex_formatting(answer)
            
            # Parse questions from response
            lines = answer.strip().split("\n")
            questions = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Remove numbering patterns like "Q1:", "1.", "1)", etc.
                line = re.sub(r'^Q?\d+[\.\):\-]\s*', '', line, flags=re.IGNORECASE)
                
                if line and not line.startswith(("Generate", "Here", "Format")):
                    questions.append({
                        "id": str(uuid.uuid4()),
                        "question": line,
                        "chapter": chapter_name,
                        "subject": subject or "general",
                        "type": "text",
                        "difficulty": difficulty,
                        "order": len(questions) + 1
                    })
            
            # Return exactly the requested number, or all if fewer
            return questions[:num_questions] if len(questions) >= num_questions else questions
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            raise
    
    def _clean_latex_formatting(self, text: str) -> str:
        """Remove LaTeX formatting and convert to plain text"""
        # Remove inline math delimiters
        text = re.sub(r'\\\(|\\\)', '', text)
        
        # Convert common LaTeX commands to plain text
        text = re.sub(r'\\sqrt\{([^}]+)\}', r'sqrt(\1)', text)
        text = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', r'(\1)/(\2)', text)
        text = re.sub(r'\\triangle', 'triangle', text)
        text = re.sub(r'\^\{?\\circ\}?', ' degrees', text)
        text = re.sub(r'\\angle', 'angle', text)
        text = re.sub(r'\\sim', '~', text)
        text = re.sub(r'\\times', '*', text)
        text = re.sub(r'\\div', '/', text)
        text = re.sub(r'\\cdot', '*', text)
        text = re.sub(r'\\left\(|\\right\)', '', text)
        text = re.sub(r'\\left\[|\\right\]', '', text)
        
        # Remove any remaining backslash commands
        text = re.sub(r'\\[a-zA-Z]+\{([^}]*)\}', r'\1', text)
        text = re.sub(r'\\[a-zA-Z]+', '', text)
        
        return text
