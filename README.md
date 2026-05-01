# AI Summarizer Take-Home

## Exercise Goal

Build a simple app/API that:

- takes a block of text as input
- uses an AI model to generate:
  - a short summary
  - 3 key action items
- returns structured JSON output

## What I Built

- Backend API built with NestJS (`backend/`)
- Frontend app built with React + Vite (`frontend/`)
- Endpoint: `POST /ai/summarize`
- Request validation and structured response enforcement
- Unit + e2e tests for backend, and frontend UI tests

## Stack

- Backend: NestJS, TypeScript, OpenAI SDK, Jest
- Frontend: React, Vite, TypeScript, Vitest, Testing Library

## Why This Stack

- **NestJS**: I chose NestJS for a clear controller/service structure, built-in validation patterns, and fast API iteration with TypeScript.
- **React**: I used React for a simple, component-driven UI to collect input and render results in both formatted and JSON views.
- **Vite**: I used Vite for fast local development and minimal setup overhead, which helped keep the project focused on functionality.

## Prompt(s) Used

I used AI-assisted prompting to guide both the implementation and the model behavior, focusing on speed while maintaining control over the final structure.

### Implementation-Oriented Prompts

* Prompted the creation of a structured NestJS backend and implemented a `POST /ai/summarize` endpoint to handle input text.
* Guided the setup of a minimal React + Vite frontend to provide a simple interface for interacting with the API.
* Directed integration between the frontend and backend to enable end-to-end testing of the summarization flow.
* Used prompts to help generate and refine tests, then executed them to validate functionality.

### AI Task Prompts

#### Initial Prompt

Summarize the following text and extract action items.

#### Refined Prompt

Summarize the following text in 2–3 sentences.

Then extract exactly 3 clear and actionable items.

Return ONLY valid JSON in the following format:
{
"summary": string,
"actionItems": string[]
}

#### Final Prompt

Summarize the following text in 2–3 sentences.

Then extract exactly 3 clear and actionable items.

Each action item should be a single focused task. Do not combine unrelated tasks into one action item.

Return ONLY valid JSON in the following format:
{
"summary": string,
"actionItems": string[]
}

Text:
"""
${input}
"""

## What Didn’t Work at First and What I Adjusted

- **Model output was sometimes not strict JSON**
  Initially, responses occasionally included extra text/formatting.
  **Adjustment:** tightened prompt instructions and added a retry pass with stronger JSON-only constraints.

- **Action items were sometimes too broad or chained**
  Early outputs occasionally combined multiple tasks into one action item.
  **Adjustment:** refined prompt constraints to require single focused, action-oriented items and added a targeted refinement step when needed.

- **Response time variability**
  Latency varied between requests.
  **Adjustment:** added clear loading states and kept reliability safeguards; further optimization (timeouts/retries/metrics/caching) is noted as future work.

## What I’d Improve With More Time

- **Harden backend reliability and error handling**
  - Add a centralized exception filter with consistent error schema (`code`, `message`, `details`, `requestId`).
  - Differentiate provider failures (timeout, rate limit, invalid response, upstream outage) into clearer status codes/messages.
  - Add request timeouts and bounded retries with backoff to prevent long hangs and noisy failures.

- **Improve output validation pipeline**
  - Add a stricter server-side response validator for summary/action quality (not just shape).
  - Introduce a “repair-only” pass when output fails validation, before returning an error to the client.
  - Log structured validation failure reasons for debugging prompt/model drift.

- **Add production-grade observability + protection**
  - Add structured logs and latency metrics around each AI call (prompt attempt count, parse retries, failure class).
  - Add rate limiting and payload size limits on `POST /ai/summarize`.
  - Add a lightweight cache for duplicate requests to reduce cost and improve response time consistency.

## Project Structure

- `backend/src/ai/ai.controller.ts` - summarize endpoint
- `backend/src/ai/ai.service.ts` - AI call + output handling
- `backend/src/ai/dto/summarize-request.dto.ts` - request DTO validation
- `backend/src/ai/dto/summarize-response.dto.ts` - response typing
- `frontend/src/App.tsx` - input + result UI (formatted/json views)
- `frontend/src/App.test.tsx` - frontend tests

## Setup

From repo root:

```bash
npm install
npm install --prefix ./backend
npm install --prefix ./frontend
```

Configure backend env:

```bash
cp backend/.env.example backend/.env
```

Required values in `backend/.env`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Optional frontend env:

```bash
cp frontend/.env.example frontend/.env
```

Default API URL in frontend env:

- `VITE_API_BASE_URL=http://localhost:3000`

## Run

Run backend + frontend together (from repo root):

```bash
npm run dev
```

Run individually:

```bash
npm run dev:backend
npm run dev:frontend
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## API Contract

### `POST /ai/summarize`

Request:

```json
{
  "text": "Input text to summarize"
}
```

Response:

```json
{
  "summary": "Short summary text",
  "actionItems": [
    "Action item one",
    "Action item two",
    "Action item three"
  ]
}
```

## Tests

Backend:

```bash
npm run --prefix ./backend test -- --runInBand --watchman=false
npm run --prefix ./backend test:e2e -- --runInBand --watchman=false
```

Frontend:

```bash
npm run --prefix ./frontend test
```
