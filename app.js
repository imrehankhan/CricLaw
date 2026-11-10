const form = document.querySelector("#ask-form"),
  input = document.querySelector("#question"),
  button = document.querySelector("#ask-button"),
  result = document.querySelector("#result");
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function formatAnswer(s) {
  return esc(s)
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`)
    .join("");
}
function showError(message) {
  result.hidden = false;
  result.innerHTML = `<div class="error">${esc(message)}</div>`;
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = input.value.trim();
  if (!question) {
    input.focus();
    return;
  }
  button.disabled = true;
  result.hidden = false;
  result.innerHTML =
    '<div class="loading">Searching the indexed Laws excerpt…</div>';
  try {
    const r = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Unable to answer this question.");
    result.innerHTML = `<div class="result-top"><span class="result-label">CRICLAW ANSWER</span><span class="result-mode">${data.mode === "llm" ? "AI + verified retrieval" : "RETRIEVAL ANSWER"}</span></div><div class="answer">${formatAnswer(data.answer)}</div>${data.sources.length ? `<div class="citations"><div class="citations-label">RETRIEVED PASSAGES</div>${data.sources.map((s, i) => `<div class="citation"><span class="citation-num">0${i + 1}</span><div><span class="citation-title">${esc(s.law)}${s.section ? ", " + esc(s.section) : ""} · ${esc(s.heading)}</span><br><span class="citation-text">${esc(s.text.slice(0, 280))}${s.text.length > 280 ? "…" : ""}</span></div></div>`).join("")}</div>` : ""}`;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (err) {
    showError(err.message);
  } finally {
    button.disabled = false;
  }
});
document.querySelectorAll(".suggestion").forEach((b) =>
  b.addEventListener("click", () => {
    input.value = b.dataset.question;
    input.focus();
  }),
);
fetch("/api/status")
  .then((r) => r.json())
  .then((s) => {
    document.querySelector("#corpus-status").textContent =
      `${s.chunks} passages indexed · ${s.llm ? "LLM connected" : "local retrieval mode"}`;
    document.querySelector("#mode-label").textContent = s.llm
      ? "Retrieval + AI answer"
      : "Grounded retrieval mode";
  })
  .catch(() => {
    document.querySelector("#corpus-status").textContent =
      "Local cricket law reference";
  });
