(() => {
  "use strict";

  const config = window.__COPY_EDITOR_CONFIG__;
  if (!config) return;

  document.documentElement.classList.add("copy-editor-active");
  const runs = [...document.querySelectorAll("[data-copy-id]")];
  for (const run of runs) {
    // Chromium forces `white-space: pre-wrap` on plaintext-only fields, which
    // exposes the indentation used to format article HTML. Standard edit mode
    // keeps the rendered layout intact; the paste handler below still strips
    // rich text before anything is saved.
    run.contentEditable = "true";
    run.spellcheck = true;
    run.dataset.copyOriginal = run.textContent;
    run.setAttribute("role", "textbox");
    run.setAttribute("aria-label", `Edit text: ${run.textContent.trim().slice(0, 80)}`);
  }

  const toolbar = document.createElement("div");
  toolbar.className = "copy-editor-toolbar";
  toolbar.innerHTML = `
    <div class="copy-editor-brand">
      <span class="copy-editor-heart">♥</span>
      <span><strong>Copy editor</strong><small>Click any outlined text to edit it</small></span>
    </div>
    <label class="copy-editor-page-label">Page
      <select class="copy-editor-page" aria-label="Page to edit"></select>
    </label>
    <span class="copy-editor-status" aria-live="polite">No unsaved changes</span>
    <button class="copy-editor-button copy-editor-reset" type="button" disabled>Discard</button>
    <button class="copy-editor-button copy-editor-save" type="button" disabled>Save changes</button>
    <a class="copy-editor-exit" href="${config.page}">Exit editor</a>
  `;
  document.body.prepend(toolbar);

  const picker = toolbar.querySelector(".copy-editor-page");
  for (const page of config.pages) {
    const option = document.createElement("option");
    option.value = page.path;
    option.textContent = page.path === "/" ? "Home" : page.title.replace(/\s*[|–-]\s*Samantha.*$/i, "");
    option.selected = page.path === config.page;
    picker.append(option);
  }

  const status = toolbar.querySelector(".copy-editor-status");
  const save = toolbar.querySelector(".copy-editor-save");
  const reset = toolbar.querySelector(".copy-editor-reset");
  let currentVersion = config.version;
  let saving = false;

  function edits() {
    return runs
      .filter((run) => run.textContent !== run.dataset.copyOriginal)
      .map((run) => ({ id: run.dataset.copyId, text: run.textContent }));
  }

  function refresh(preserveStatus = false) {
    const changed = edits();
    for (const run of runs) run.classList.toggle("copy-editor-changed", run.textContent !== run.dataset.copyOriginal);
    save.disabled = saving || changed.length === 0;
    reset.disabled = saving || changed.length === 0;
    if (!saving && !preserveStatus) {
      status.classList.remove("copy-editor-error");
      status.textContent = changed.length ? `${changed.length} unsaved change${changed.length === 1 ? "" : "s"}` : "No unsaved changes";
    }
  }

  document.addEventListener("input", (event) => {
    if (event.target.closest?.("[data-copy-id]")) refresh();
  });

  document.addEventListener("paste", (event) => {
    const target = event.target.closest?.("[data-copy-id]");
    if (!target) return;
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a");
    if (link && !link.closest(".copy-editor-toolbar")) event.preventDefault();
  });

  picker.addEventListener("change", () => {
    if (edits().length && !window.confirm("Discard your unsaved changes and open another page?")) {
      picker.value = config.page;
      return;
    }
    window.location.href = `${picker.value}?copy-edit=1`;
  });

  reset.addEventListener("click", () => {
    if (!window.confirm("Discard all unsaved changes on this page?")) return;
    for (const run of runs) run.textContent = run.dataset.copyOriginal;
    refresh();
  });

  save.addEventListener("click", async () => {
    const changed = edits();
    if (!changed.length || saving) return;
    saving = true;
    status.classList.remove("copy-editor-error");
    status.textContent = "Saving…";
    refresh();
    let preserveStatus = false;
    try {
      const response = await fetch("/__copy_editor/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: config.page, version: currentVersion, edits: changed }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save failed");
      currentVersion = result.version;
      for (const run of runs) run.dataset.copyOriginal = run.textContent;
      status.textContent = `Saved ${result.count} change${result.count === 1 ? "" : "s"}`;
      preserveStatus = true;
      window.setTimeout(refresh, 1400);
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("copy-editor-error");
      preserveStatus = true;
    } finally {
      saving = false;
      refresh(preserveStatus);
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!edits().length) return;
    event.preventDefault();
    event.returnValue = "";
  });

  refresh();
})();
