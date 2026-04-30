# AI Summarizer API (NestJS)

Small take-home project that accepts a block of text, uses an AI model to summarize it, and returns 3 focused action items in structured JSON.

## What I built

- A NestJS backend in `backend/`
- Endpoint: `POST /ai/summarize`
- Input validation with `class-validator` + global `ValidationPipe`
- OpenAI integration via `openai` SDK
- Structured response enforcement:
  - `summary` (string)
  - `actionItems` (exactly 3 non-empty strings)
- Reliability handling:
  - retry once for malformed model output
  - optional action-item refinement when items are chained/multi-task
- Test coverage with Jest (unit + e2e)

## Tech stack

- Backend:
  - NestJS
  - TypeScript
  - OpenAI SDK
  - Jest
- Frontend:
  - React (Vite)
  - TypeScript
  - Vitest
  - Testing Library

## Project structure

- `backend/src/ai/ai.controller.ts` - summarize route
- `backend/src/ai/ai.service.ts` - OpenAI call, parsing, validation, refinement
- `backend/src/ai/dto/summarize-request.dto.ts` - request validation
- `backend/src/ai/dto/summarize-response.dto.ts` - typed response contract
- `backend/src/main.ts` - global validation pipe
- `frontend/src/App.tsx` - input form, submit flow, result rendering, view toggle
- `frontend/src/App.test.tsx` - frontend UI tests
- `frontend/src/test/setup.ts` - test setup (`jest-dom`)
- `frontend/.env.example` - frontend API base URL template

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Install root dependencies (for running both apps together):

```bash
cd ..
npm install
```

4. Configure backend environment:

```bash
cp .env.example .env
```

Set in `backend/.env`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (currently `gpt-5.4-mini`)

## Run

Run both frontend and backend together (from repo root):

```bash
npm run dev
```

Run backend only:

```bash
cd backend
npm run start
```

Backend default: `http://localhost:3000`

Run frontend only:

```bash
cd frontend
npm run dev
```

Frontend default: `http://localhost:5173`

## API usage

### POST `/ai/summarize`

Request body:

```json
{
  "text": "We need to finalize the API, review the UI, update docs, notify stakeholders, and run QA before launch."
}
```

Successful response shape:

```json
{
  "summary": "The team is preparing for launch by completing API/UI work and release readiness tasks.",
  "actionItems": [
    "Finalize the API implementation.",
    "Review the UI updates.",
    "Run QA testing before launch."
  ]
}
```

## Tests

Backend tests (from `backend/`):

```bash
# unit tests
npm run test -- --runInBand --watchman=false

# e2e tests
npm run test:e2e -- --runInBand --watchman=false
```

Frontend tests (from `frontend/`):

```bash
npm run test
```

## Notes

- This is intentionally scoped as a lightweight backend implementation (not a full production system).
- Error handling is explicit for invalid input, missing configuration, provider failures, and malformed model output.
