# Quick Start Guide

## First Time Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -e .

# Create environment file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Initialize and seed database
python -m app.db.init_db
python -m app.db.seed

# Start backend server
python main.py
```

Backend will run at: http://localhost:8000
API Docs: http://localhost:8000/docs

### 2. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: http://localhost:5173

## Daily Development

### Start Both Servers

**Option 1: Separate Terminals**

Terminal 1 (Backend):

```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
python main.py
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

**Option 2: Use VS Code Tasks**

- Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on macOS)
- Select "Run Both: Frontend & Backend"

## Login Credentials

After seeding the database, use these credentials:

### Student

- Email: student@eduassess.com
- Password: student123

### Teacher

- Email: teacher@eduassess.com
- Password: teacher123

## Common Commands

### Backend

```bash
# Start server with auto-reload
python main.py

# Initialize database
python -m app.db.init_db

# Seed sample data
python -m app.db.seed

# Run tests
pytest tests/ -v

# Check code quality
ruff check .
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

### Backend won't start

- Check if port 8000 is available
- Verify virtual environment is activated
- Ensure all dependencies are installed: `pip install -e .`
- Check `.env` file exists

### Frontend won't start

- Check if port 5173 is available
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

### Database issues

- Delete `eduassess.db` file
- Run `python -m app.db.init_db` again
- Run `python -m app.db.seed` to add sample data

### CORS errors

- Verify backend is running on port 8000
- Check BACKEND_CORS_ORIGINS in `.env` includes `http://localhost:5173`

## Development Tips

1. **Hot Reload**: Both frontend and backend support auto-reload during development
2. **API Testing**: Use http://localhost:8000/docs for interactive API testing
3. **Database Viewer**: Use tools like DB Browser for SQLite to view the database
4. **Network Tab**: Use browser DevTools to debug API calls
5. **React DevTools**: Install React DevTools browser extension for component debugging

## Project Structure Quick Reference

```
frontend/src/
  ├── components/      # Reusable UI components
  ├── pages/          # Page-level components
  ├── services/       # API integration
  ├── store/          # Global state (Zustand)
  └── hooks/          # Custom React hooks

backend/app/
  ├── api/routes/     # API endpoints
  ├── models/         # Database models
  ├── schemas/        # Request/response validation
  ├── core/           # Config & security
  └── db/             # Database utilities
```

## Next Steps

1. Explore the API documentation at http://localhost:8000/docs
2. Try logging in with different user roles
3. Create a test assessment
4. View student progress tracking
5. Customize the application for your needs

Happy coding! 🚀
