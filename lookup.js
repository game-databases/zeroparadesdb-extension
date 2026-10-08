import { BASE } from "./config.mjs";
import { createClient, gameLocale } from "./zeroparades.mjs";

const api = globalThis.browser ?? globalThis.chrome;
const text = (key) => api.i18n.getMessage(key);
const result = document.getElementById("result");
const term = new URLSearchParams(location.search).get("q") ?? "";
document.documentElement.lang = gameLocale(api.i18n.getUILanguage());
document.title = term;

function element(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function card(entry) {
  const facts = entry.card?.facts ?? [];
  const description = entry.card?.description ?? entry.detail;
  return element("article", { className: "card" }, [
    element("header", {}, [
      ...(entry.card?.icon ? [element("img", { src: entry.card.icon, alt: "", width: 48, height: 48 })] : []),
      element("h1", { textContent: entry.card?.name ?? entry.name }),
    ]),
    ...(facts.length ? [element("ul", { className: "facts" }, facts.map((fact) => element("li", { textContent: fact })))] : []),
    ...(description ? [element("p", { textContent: description })] : []),
    element("a", { href: entry.url, target: "_blank", rel: "noopener", textContent: text("open") }),
  ]);
}

async function show() {
  const found = await createClient({ base: BASE }).lookup(term, { locale: document.documentElement.lang })
    .catch(() => ({ found: false, failed: true }));
  if (found.found) {
    result.replaceChildren(...found.entries.map(card));
    return;
  }
  result.replaceChildren(element("article", { className: "card empty" }, [
    element("h1", { textContent: term }),
    element("p", { textContent: text(found.failed ? "unreachable" : "none") }),
    ...(found.searchUrl ? [element("a", { href: found.searchUrl, target: "_blank", rel: "noopener", textContent: text("search") })] : []),
  ]));
}

show();
