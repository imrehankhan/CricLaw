# CRICLAW

**An LLM-powered conversational assistant for cricket rules and regulations.**

CRICLAW retrieves relevant passages from the provided `laws_middle_pages.txt` excerpt and displays those passages with each response. It can optionally send the question and retrieved passages to Groq's OpenAI-compatible chat completions API to synthesize an answer. Without credentials, it runs in local retrieval mode and forms a response from the highest-ranked passage.

## Run locally

Requires Node.js 18 or newer; no package installation is needed.

```sh
npm start
```

Open <http://localhost:3000>.

To enable generated answers, add your key to the root `.env` file:

```env
GROQ_API_KEY=your-groq-key-here
GROQ_MODEL=openai/gpt-oss-120b
# GROQ_BASE_URL=https://api.groq.com/openai/v1/chat/completions
```

Then restart `npm start`. The server loads `.env` at startup, and shell environment variables take precedence. `.env` is ignored by Git; `.env.example` documents the available settings. The Groq API key stays on the server and is never sent to the browser.

## Corpus scope

The project includes the original 79-page MCC PDF and the provided middle-pages text excerpt. Retrieval currently indexes only `data/laws_middle_pages.txt`; it does not index the full PDF. The provided abstract mentions ICC Test, ODI, and T20I Playing Conditions, but those datasets were not attached. Responses identify these limits and cite the indexed passages. The source passages are treated as reference data, not as instructions to the assistant.

## Retrieval

The server segments the text into law/section passages and ranks them with a lightweight BM25-style lexical retriever. Retrieved passages are included in the API response as citations. For a complete production RAG pipeline, add text extracted from the entire rulebook and official format-specific playing conditions, then replace or augment lexical retrieval with embeddings and a persistent vector index.

## Files

- `data/laws_middle_pages.txt` — supplied searchable excerpt used by retrieval.
- `data/laws_of_cricket_2017_MCC.pdf` — supplied MCC rulebook source.
- `server.js` — local server, retrieval, and optional LLM call.
