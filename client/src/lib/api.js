export async function translate(input, dialect, onChunk, onDone, onError) {
  let reader;
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, dialect }),
    });

    if (!response.ok) {
      const text = await response.text();
      onError(text || 'The algorithm failed. A sign, perhaps, that we are too early.');
      return;
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const raw = line.slice(6).trim();
        if (raw === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(raw);
          if (parsed.text) onChunk(parsed.text);
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }

    onDone();
  } catch (err) {
    const isTimeout =
      err.name === 'AbortError' || err.message?.toLowerCase().includes('timeout');
    onError(
      isTimeout
        ? 'The model is thinking. As all great thinkers do, slowly.'
        : 'The algorithm failed. A sign, perhaps, that we are too early.'
    );
  } finally {
    try {
      reader?.releaseLock();
    } catch {
      // ignore
    }
  }
}
