import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';

type ViewMode = 'formatted' | 'json';
type UiState = 'idle' | 'loading' | 'success' | 'error';

interface SummaryResponse {
  summary: string;
  actionItems: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function App() {
  const [text, setText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  const [status, setStatus] = useState<UiState>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<SummaryResponse | null>(null);

  const canSubmit = text.trim().length > 0 && status !== 'loading';
  const jsonOutput = useMemo(
    () => JSON.stringify(result, null, 2),
    [result],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setStatus('error');
      setError('Please enter text before submitting.');
      return;
    }

    setStatus('loading');
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        const message = Array.isArray(errorPayload?.message)
          ? errorPayload.message.join(', ')
          : errorPayload?.message ?? 'Request failed. Please try again.';
        throw new Error(message);
      }

      const payload = (await response.json()) as SummaryResponse;
      setResult(payload);
      setStatus('success');
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to reach backend. Make sure the API is running.';
      setError(message);
      setStatus('error');
    }
  };

  return (
    <main className="app">
      <h1>AI Summarizer</h1>
      <p className="subtitle">Paste text, submit, and inspect result output.</p>

      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="source-text">Input text</label>
        <textarea
          id="source-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste or type the text to summarize..."
          rows={10}
        />
        <div className="actions">
          <button type="submit" disabled={!canSubmit}>
            {status === 'loading' ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
      </form>

      <section className="card result-card">
        <div className="result-header">
          <h2>Result</h2>
          <div className="toggle-group">
            <button
              type="button"
              className={viewMode === 'formatted' ? 'active' : ''}
              onClick={() => setViewMode('formatted')}
            >
              Formatted
            </button>
            <button
              type="button"
              className={viewMode === 'json' ? 'active' : ''}
              onClick={() => setViewMode('json')}
            >
              JSON
            </button>
          </div>
        </div>

        {status === 'idle' && (
          <p className="muted">Submit text to see a summary and action items.</p>
        )}
        {status === 'loading' && <p className="muted">Processing input...</p>}
        {status === 'error' && <p className="error">{error}</p>}

        {status === 'success' && result && viewMode === 'formatted' && (
          <div className="formatted">
            <h3>Summary</h3>
            <p>{result.summary}</p>
            <h3>Action Items</h3>
            <ul>
              {result.actionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {status === 'success' && result && viewMode === 'json' && (
          <pre className="json-block">{jsonOutput}</pre>
        )}
      </section>
    </main>
  );
}

export default App;
