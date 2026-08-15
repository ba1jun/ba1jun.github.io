let pagefind: any = null; // eslint-disable-line -- Pagefind has no published types
let setupController: AbortController | null = null;

async function getPagefind() {
  if (!pagefind) {
    // pagefind.js only exists after the postbuild `pagefind --site dist`
    // step, so this must stay a runtime import the bundler never resolves.
    const path = "/pagefind/pagefind.js";
    pagefind = await import(/* @vite-ignore */ path);
    await pagefind.init();
  }
  return pagefind;
}

function setup() {
  // Abort previous listeners from prior navigation
  setupController?.abort();
  setupController = new AbortController();
  const { signal } = setupController;

  const dialog = document.getElementById(
    "searchDialog",
  ) as HTMLDialogElement | null;
  const trigger = document.getElementById("searchTrigger");
  const input = document.getElementById(
    "searchInput",
  ) as HTMLInputElement | null;
  const clearBtn = document.getElementById(
    "searchClear",
  ) as HTMLButtonElement | null;
  const results = document.getElementById("searchResults");
  const summary = document.getElementById("searchSummary");

  if (!dialog || !trigger || !input || !results || !summary || !clearBtn)
    return;

  // Non-null aliases (guard above ensures these are set)
  const d = dialog;
  const inp = input;
  const res = results;
  const sum = summary;
  const clr = clearBtn;

  let debounceTimer: ReturnType<typeof setTimeout>;

  function openSearch() {
    d.showModal();
    inp.focus();
  }

  function closeSearch() {
    d.close();
  }

  trigger.addEventListener("click", openSearch, { signal });

  d.addEventListener(
    "click",
    (e) => {
      if (e.target === d) closeSearch();
    },
    { signal },
  );

  clr.addEventListener(
    "click",
    () => {
      inp.value = "";
      clr.hidden = true;
      res.innerHTML = "";
      sum.textContent = "";
      inp.focus();
    },
    { signal },
  );

  inp.addEventListener(
    "input",
    () => {
      const query = inp.value.trim();
      clr.hidden = query.length === 0;
      clearTimeout(debounceTimer);
      if (!query) {
        res.innerHTML = "";
        sum.textContent = "";
        return;
      }
      debounceTimer = setTimeout(() => performSearch(query), 150);
    },
    { signal },
  );

  async function performSearch(query: string) {
    try {
      const pf = await getPagefind();
      const search = await pf.search(query, {
        filters: { collection: "journeys" },
      });

      sum.textContent = `${search.results.length} result${search.results.length !== 1 ? "s" : ""} for "${query}"`;

      const fragment = document.createDocumentFragment();
      const toLoad = search.results.slice(0, 10);
      const loaded = await Promise.all(toLoad.map((r: any) => r.data()));

      for (const result of loaded) {
        const card = document.createElement("a");
        card.href = result.url;
        card.className = "result-card";
        card.addEventListener("click", () => closeSearch());

        if (result.meta?.image) {
          const img = document.createElement("img");
          img.className = "result-image";
          img.src = result.meta.image;
          img.alt = result.meta.title || "";
          img.loading = "lazy";
          card.appendChild(img);
        }
        const content = document.createElement("div");
        content.className = "result-content";
        const titleDiv = document.createElement("div");
        titleDiv.className = "result-title";
        titleDiv.textContent = result.meta?.title || result.url;
        content.appendChild(titleDiv);
        if (result.excerpt) {
          const excerptDiv = document.createElement("div");
          excerptDiv.className = "result-excerpt";
          excerptDiv.innerHTML = result.excerpt; // Pagefind excerpt contains <mark> tags
          content.appendChild(excerptDiv);
        }
        card.appendChild(content);
        fragment.appendChild(card);
      }

      res.innerHTML = "";
      if (loaded.length === 0) {
        res.innerHTML = `<div class="result-empty">No results found</div>`;
      } else {
        res.appendChild(fragment);
      }
    } catch {
      res.innerHTML = `<div class="result-empty">Search unavailable</div>`;
    }
  }

  // Keyboard shortcut: Ctrl+K / Cmd+K
  document.addEventListener(
    "keydown",
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (dialog.open) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    },
    { signal },
  );
}

document.addEventListener("astro:page-load", setup);
