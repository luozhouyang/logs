import { mount } from "@cloudflare/nimbus-docs/client";

function initPageActions(root: HTMLElement): () => void {
  const copyBtn = root.querySelector<HTMLButtonElement>("[data-nb-page-actions-copy]");
  const copyIcon = root.querySelector<SVGElement>("[data-nb-page-actions-copy-icon]");
  const checkIcon = root.querySelector<SVGElement>("[data-nb-page-actions-check-icon]");
  const label = root.querySelector<HTMLSpanElement>("[data-nb-page-actions-label]");
  const mdUrl = root.dataset.mdUrl;
  // Labels travel as data attributes so the same component works in any
  // locale without shipping every language's strings to the client.
  const labels = {
    copyPage: root.dataset.labelCopyPage ?? "Copy page",
    copied: root.dataset.labelCopied ?? "Copied",
    copyError: root.dataset.labelCopyError ?? "Couldn't copy",
  };

  if (!copyBtn || !mdUrl) return () => {};

  let resetTimer: number | undefined;

  function showState(state: "copied" | "error") {
    if (!copyIcon || !checkIcon || !label) return;
    if (state === "copied") {
      copyIcon.classList.add("hidden");
      checkIcon.classList.remove("hidden");
      label.textContent = labels.copied;
    } else {
      label.textContent = labels.copyError;
    }
    if (resetTimer) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      copyIcon.classList.remove("hidden");
      checkIcon.classList.add("hidden");
      label.textContent = labels.copyPage;
    }, 1500);
  }

  async function handleCopyPage() {
    try {
      const res = await fetch(mdUrl!);
      if (!res.ok) {
        showState("error");
        return;
      }
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      showState("copied");
    } catch {
      showState("error");
    }
  }

  copyBtn.addEventListener("click", handleCopyPage);

  return () => {
    if (resetTimer) window.clearTimeout(resetTimer);
    copyBtn.removeEventListener("click", handleCopyPage);
  };
}

mount("[data-nb-page-actions]", initPageActions);
