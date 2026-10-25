# CourseMate AI – Backend (Stage 1)
Requires Node 18+ and MongoDB running locally (or an Atlas URI).
```
cd backend && cp .env.example .env   # set JWT_SECRET
npm install && npm run seed && npm start
```
Demo student: demo@coursemate.ai / password123 · Admin: admin@coursemate.ai / password123

**Scoring:** final = 0.7 × content (TF cosine on skills/interests/domain/text) + 0.2 × collaborative (user–user cosine on saved/learning-path history) + 0.1 × level match.
Scores are relevance estimates, not evaluated accuracy. Free text ("Tell us what you want to learn") is keyword-extracted and added to the student vector.
Try: `POST /api/auth/login` → `POST /api/recommendations/generate` with `Authorization: Bearer <token>`.
