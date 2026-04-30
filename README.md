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

- NestJS
- TypeScript
- OpenAI SDK
- Jest

## Project structure

- `backend/src/ai/ai.controller.ts` - summarize route
- `backend/src/ai/ai.service.ts` - OpenAI call, parsing, validation, refinement
- `backend/src/ai/dto/summarize-request.dto.ts` - request validation
- `backend/src/ai/dto/summarize-response.dto.ts` - typed response contract
- `backend/src/main.ts` - global validation pipe

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Set in `backend/.env`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (currently `gpt-5.4-mini`)

## Run

From `backend/`:

```bash
npm run start
```

Server default: `http://localhost:3000`

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

From `backend/`:

```bash
# unit tests
npm run test -- --runInBand --watchman=false

# e2e tests
npm run test:e2e -- --runInBand --watchman=false
```

## Notes

- This is intentionally scoped as a lightweight backend implementation (not a full production system).
- Error handling is explicit for invalid input, missing configuration, provider failures, and malformed model output.
