/**
 * Interactive terminal for the landing page.
 *
 * On load it plays a scripted tour: it types a command, prints the result,
 * holds, then continues. The tour walks every section and every post, so all
 * core pages are surfaced without the visitor clicking anything.
 *
 * Typing (or clicking) hands control to the visitor and stops the tour. Once
 * the visitor's command has printed and they've been idle for `idleMs`
 * (10s by default), the tour picks up again where it left off.
 */

export interface TerminalPost {
  id: string;
  href: string;
  title: string;
  description: string;
  date: string;
  section: string;
}

export interface TerminalData {
  locale: "en" | "zh";
  home: string;
  prompt: { user: string; path: string };
  sections: { slug: string; label: string }[];
  posts: TerminalPost[];
  links: { rss: string; llms: string; github: string; other: { href: string; label: string } };
  copy: TerminalCopy;
  idleMs: number;
}

export interface TerminalCopy {
  banner: string[];
  help: string[];
  whoami: string[];
  about: string[];
  auto: string;
  manual: string;
  resume: string;
  helpTitle: string;
  posts: string;
  lsHint: string;
  opening: string;
  notFound: string;
  tryHelp: string;
  noSection: string;
  noPost: string;
  usage: string;
  findNothing: string;
  langCurrent: string;
  langSwitch: string;
}

const FIRST_TOUR = ["whoami", "ls"] as const;
const LAST_TOUR = ["about", "help"] as const;

function buildTour(data: TerminalData): string[] {
  const tour: string[] = [...FIRST_TOUR];

  for (const section of data.sections) {
    tour.push(`ls ${section.slug}`);
    const posts = data.posts
      .filter((post) => post.section === section.slug)
      .sort((a, b) => b.date.localeCompare(a.date));
    for (const post of posts) tour.push(`cat ${post.id}`);
  }

  tour.push(...LAST_TOUR);
  return tour;
}

export function initTerminal(root: HTMLElement, data: TerminalData) {
  const output = root.querySelector<HTMLElement>("[data-term-output]");
  const form = root.querySelector<HTMLFormElement>("[data-term-form]");
  const input = root.querySelector<HTMLInputElement>("[data-term-input]");
  const caret = root.querySelector<HTMLElement>("[data-term-caret]");
  const status = root.querySelector<HTMLElement>("[data-term-status]");
  const screen = root.querySelector<HTMLElement>("[data-term-screen]");
  if (!output || !form || !input || !status || !screen) return;

  // Re-bind as non-null locals: TypeScript doesn't carry the guard's narrowing
  // into the closures below.
  const out: HTMLElement = output;

  const copy = data.copy;
  const helpLines = copy.help;
  const whoamiLines = copy.whoami;
  const aboutLines = copy.about;

  // Read at schedule time so a host page (or a test) can retune the idle delay.
  const idleDelay = () => Number(root.dataset.idleMs ?? data.idleMs) || data.idleMs;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TYPE_MS = reduced ? 0 : 22;
  const HOLD_MS = reduced ? 800 : 1500;

  const tour = buildTour(data);
  let auto = true;
  let tourIndex = 0;
  let typeToken = 0;
  let autoTyped = false;
  let idleTimer: number | undefined;
  const history: string[] = [];
  let historyPos = -1;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // ---- rendering -----------------------------------------------------------

  function node(tag: string, className: string, text?: string) {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function link(text: string, href: string) {
    const anchor = node("a", "term-link", text) as HTMLAnchorElement;
    anchor.href = href;
    return anchor;
  }

  function push(children: (string | Node)[], className = "term-out") {
    const row = node("div", `term-line ${className}`);
    for (const child of children) {
      row.append(typeof child === "string" ? document.createTextNode(child) : child);
    }
    out.append(row);
    // Keep the scrollback bounded on long sessions.
    while (out.childElementCount > 400) out.firstElementChild?.remove();
    screen!.scrollTop = screen!.scrollHeight;
  }

  function pushEcho(command: string) {
    const prompt = node("span", "term-prompt", "$ ");
    const line = node("span", "term-cmd", command);
    push([prompt, line], "term-line");
  }

  function pushError(message: string) {
    push([node("span", "term-err", message)]);
  }

  // ---- commands ------------------------------------------------------------

  const findPost = (query: string) =>
    data.posts.find((post) => post.id === query) ??
    data.posts.find((post) => post.id.split("/").pop() === query) ??
    data.posts.find((post) => post.id.toLowerCase().startsWith(query.toLowerCase()));

  function cmdLs(section?: string) {
    if (!section) {
      for (const item of data.sections) {
        const posts = data.posts.filter((post) => post.section === item.slug);
        push([link(`${item.slug}/`, `#${item.slug}`), node("span", "term-dim", `  ${posts.length} ${copy.posts}`)]);
      }
      push([node("span", "term-dim", copy.lsHint)]);
      return;
    }

    const posts = data.posts.filter((post) => post.section === section);
    if (posts.length === 0) {
      pushError(`${copy.noSection} ${section}`);
      return;
    }
    for (const post of [...posts].sort((a, b) => b.date.localeCompare(a.date))) {
      push([
        node("span", "term-dim", `${post.date}  `),
        link(post.title, post.href),
      ]);
    }
  }

  function cmdCat(raw?: string) {
    if (!raw) {
      pushError(`${copy.usage} cat <post>`);
      return;
    }
    const post = findPost(raw);
    if (!post) {
      pushError(`${copy.noPost} ${raw}`);
      return;
    }
    push([node("span", "term-title", post.title)]);
    push([node("span", "term-dim", `${post.date}  ·  ${post.section}  ·  `), link(post.id, post.href)]);
    if (post.description) push([node("span", "term-out", post.description)]);
  }

  function cmdOpen(raw?: string) {
    if (!raw) {
      pushError(`${copy.usage} open <post>`);
      return;
    }
    const post = findPost(raw);
    if (!post) {
      pushError(`${copy.noPost} ${raw}`);
      return;
    }
    push([node("span", "term-dim", `${copy.opening} ${post.href}`)]);
    window.location.href = post.href;
  }

  function cmdFind(term?: string) {
    if (!term) {
      pushError(`${copy.usage} find <keyword>`);
      return;
    }
    const needle = term.toLowerCase();
    const hits = data.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(needle) ||
        post.description.toLowerCase().includes(needle) ||
        post.id.toLowerCase().includes(needle),
    );
    if (hits.length === 0) {
      push([node("span", "term-dim", `${copy.findNothing} ${term}`)]);
      return;
    }
    for (const post of hits) push([node("span", "term-dim", `${post.date}  `), link(post.title, post.href)]);
  }

  function cmdLink(name: string) {
    const href =
      name === "rss" ? data.links.rss : name === "llms" ? data.links.llms : data.links.github;
    const external = name === "github";
    const anchor = link(href, href);
    if (external) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    push([node("span", "term-dim", `${name} → `), anchor]);
  }

  function cmdLang() {
    push([
      node("span", "term-dim", copy.langCurrent),
      node("span", "term-cmd", ` ${data.locale}`),
      node("span", "term-dim", `  ·  ${copy.langSwitch} `),
      link(data.links.other.label, data.links.other.href),
    ]);
  }

  function execute(raw: string) {
    const command = raw.trim();
    pushEcho(command);
    if (!command) return;

    const [name, ...args] = command.split(/\s+/);
    const argument = args.join(" ");

    switch (name) {
      case "help":
        push([node("span", "term-dim", copy.helpTitle)]);
        for (const entry of helpLines) {
          const [cmd, ...rest] = entry.split("|");
          push([node("span", "term-key term-col", `  ${cmd}`), node("span", "term-dim", rest.join("|"))]);
        }
        break;
      case "ls":
        cmdLs(args[0]);
        break;
      case "cat":
        cmdCat(argument);
        break;
      case "open":
        cmdOpen(argument);
        break;
      case "find":
        cmdFind(argument);
        break;
      case "whoami":
        for (const line of whoamiLines) push([node("span", "term-out", line)]);
        break;
      case "about":
        for (const line of aboutLines) push([node("span", "term-out", line)]);
        break;
      case "pwd":
        push([node("span", "term-out", "~/log")]);
        break;
      case "date":
        push([node("span", "term-out", new Date().toString())]);
        break;
      case "echo":
        push([node("span", "term-out", argument)]);
        break;
      case "rss":
      case "llms":
      case "github":
        cmdLink(name);
        break;
      case "lang":
        cmdLang();
        break;
      case "zh":
      case "en":
        window.location.href = data.links.other.href;
        break;
      case "clear":
        out.replaceChildren();
        break;
      default:
        pushError(`${copy.notFound} ${name}`);
        push([node("span", "term-dim", copy.tryHelp ?? "type 'help'")]);
    }
  }

  // ---- autoplay ------------------------------------------------------------

  function updateStatus() {
    const label = auto ? (copy.auto) : (copy.manual);
    status!.textContent = label;
    status!.dataset.state = auto ? "auto" : "manual";
    out.setAttribute("aria-live", auto ? "off" : "polite");
  }

  async function typeCommand(text: string, token: number) {
    autoTyped = true;
    input!.value = "";
    for (let index = 0; index < text.length; index += 1) {
      if (token !== typeToken || !auto) return false;
      input!.value = text.slice(0, index + 1);
      screen!.scrollTop = screen!.scrollHeight;
      if (TYPE_MS > 0) await sleep(TYPE_MS + Math.random() * 16);
    }
    return true;
  }

  async function autoStep() {
    if (!auto || document.hidden) {
      // Retry when the tab is visible again; the tour should never run blind.
      if (!auto) return;
      window.setTimeout(autoStep, 1200);
      return;
    }

    const command = tour[tourIndex % tour.length];
    const token = ++typeToken;

    if (!(await typeCommand(command, token))) return;
    await sleep(reduced ? 60 : 140);
    if (!auto) return;

    input!.value = "";
    autoTyped = false;
    execute(command);

    await sleep(HOLD_MS);
    if (!auto) return;

    tourIndex += 1;
    void autoStep();
  }

  function stopAuto() {
    if (!auto) return;
    auto = false;
    typeToken += 1;
    if (autoTyped) {
      input!.value = "";
      autoTyped = false;
    }
    window.clearTimeout(idleTimer);
    updateStatus();
  }

  function scheduleResume() {
    window.clearTimeout(idleTimer);
    if (auto) return;
    idleTimer = window.setTimeout(() => {
      if (input!.value.trim().length > 0) return;
      auto = true;
      autoTyped = false;
      input!.blur();
      updateStatus();
      push([node("span", "term-dim", copy.resume)]);
      void autoStep();
    }, idleDelay());
  }

  // ---- wiring --------------------------------------------------------------

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    stopAuto();
    const value = input!.value;
    input!.value = "";
    autoTyped = false;
    if (value.trim()) {
      history.push(value.trim());
      historyPos = -1;
    }
    execute(value);
    scheduleResume();
  });

  input.addEventListener("keydown", (event) => {
    stopAuto();
    if (event.key === "ArrowUp" && history.length > 0) {
      event.preventDefault();
      historyPos = historyPos === -1 ? history.length - 1 : Math.max(0, historyPos - 1);
      input.value = history[historyPos] ?? "";
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      historyPos = historyPos === -1 ? -1 : Math.min(history.length - 1, historyPos + 1);
      input.value = historyPos === -1 ? "" : (history[historyPos] ?? "");
    } else if (event.key === "l" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      out.replaceChildren();
    } else if (event.key === "Tab") {
      event.preventDefault();
      const partial = input.value.trim();
      const match = tour.find((command) => command.startsWith(partial) && partial.length > 0);
      if (match) input.value = match;
    }
    scheduleResume();
  });

  input.addEventListener("focus", () => {
    stopAuto();
    caret?.classList.add("is-hidden");
  });

  input.addEventListener("blur", () => {
    caret?.classList.remove("is-hidden");
    scheduleResume();
  });

  screen.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("a")) return;
    stopAuto();
    input.focus();
  });

  // First paint: banner + the tour takes over.
  for (const line of data.copy.banner) {
    push([node("span", "term-out", line)]);
  }
  updateStatus();
  void autoStep();
}
