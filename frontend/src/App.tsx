import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';

type ViewMode = 'formatted' | 'json';
type UiState = 'idle' | 'loading' | 'success' | 'error';
type ThemeMode = 'light' | 'dark';

interface SummaryResponse {
  summary: string;
  actionItems: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function App() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [text, setText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  const [status, setStatus] = useState<UiState>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<SummaryResponse | null>(null);

  const canSubmit = text.trim().length > 0 && status !== 'loading';
  const renderHighlightedJson = (data: SummaryResponse) => (
    <>
      <span className="json-punctuation">{'{'}</span>
      {'\n'}
      <span className="json-indent">{'  '}</span>
      <span className="json-key">"summary"</span>
      <span className="json-punctuation">: </span>
      <span className="json-string">"{data.summary}"</span>
      <span className="json-punctuation">,</span>
      {'\n'}
      <span className="json-indent">{'  '}</span>
      <span className="json-key">"actionItems"</span>
      <span className="json-punctuation">: [</span>
      {'\n'}
      {data.actionItems.map((item, index) => (
        <span key={item}>
          <span className="json-indent">{'    '}</span>
          <span className="json-string">"{item}"</span>
          {index < data.actionItems.length - 1 && (
            <span className="json-punctuation">,</span>
          )}
          {'\n'}
        </span>
      ))}
      <span className="json-indent">{'  '}</span>
      <span className="json-punctuation">]</span>
      {'\n'}
      <span className="json-punctuation">{'}'}</span>
    </>
  );

  useEffect(() => {
    const storage =
      typeof window !== 'undefined' &&
      window.localStorage &&
      typeof window.localStorage.getItem === 'function'
        ? window.localStorage
        : null;
    const storedTheme = storage?.getItem('theme') as ThemeMode | null;
    const nextTheme =
      storedTheme ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (
      typeof window !== 'undefined' &&
      window.localStorage &&
      typeof window.localStorage.setItem === 'function'
    ) {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

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
    <main className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Summarizer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste text, submit, and inspect result output.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </Button>
      </div>

      <form className="mt-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="source-text">Input text</Label>
            <Textarea
              id="source-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste or type the text to summarize..."
              rows={10}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
            {status === 'loading' ? 'Summarizing...' : 'Summarize'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <section className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Result</CardTitle>
            <div className="flex gap-2">
              <Button
              type="button"
              size="sm"
              variant={viewMode === 'formatted' ? 'default' : 'outline'}
              onClick={() => setViewMode('formatted')}
            >
              Formatted
              </Button>
              <Button
              type="button"
              size="sm"
              variant={viewMode === 'json' ? 'default' : 'outline'}
              onClick={() => setViewMode('json')}
            >
              JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {status === 'idle' && (
              <p className="text-sm text-muted-foreground">
                Submit text to see a summary and action items.
              </p>
            )}
            {status === 'loading' && (
              <p className="text-sm text-muted-foreground">Processing input...</p>
            )}
            {status === 'error' && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            {status === 'success' && result && viewMode === 'formatted' && (
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="mb-2 text-base font-semibold">Summary</h3>
                  <p>{result.summary}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-base font-semibold">Action Items</h3>
                  <ul className="list-disc space-y-1 pl-5">
                    {result.actionItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {status === 'success' && result && viewMode === 'json' && (
              <pre className="overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {renderHighlightedJson(result)}
              </pre>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default App;
