import { BASE } from "./config.mjs";
import { createClient, gameLocale } from "./zeroparades.mjs";

const api = globalThis.browser ?? globalThis.chrome;
const client = createClient({ base: BASE });
const locale = () => gameLocale(api.i18n.getUILanguage());
const escape = (text) => text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
const unanswered = (error) => {
  console.warn("zeroparadesdb.com lookup failed:", error);
  return { found: false };
};

api.runtime.onInstalled.addListener(() => {
  api.contextMenus.create({ id: "zp-lookup", title: api.i18n.getMessage("menu"), contexts: ["selection"] });
});

/** The selected text goes to the lookup window; nothing else of the page leaves it. */
api.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "zp-lookup" || !info.selectionText) return;
  const url = api.runtime.getURL(`lookup.html?${new URLSearchParams({ q: info.selectionText.slice(0, 200) })}`);
  api.windows.create({ url, type: "popup", width: 440, height: 600 });
});

api.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const found = await client.lookup(text, { locale: locale(), limit: 5 }).catch(unanswered);
  suggest(found.found ? found.entries.map((entry) => ({ content: entry.url, description: escape(entry.name) })) : []);
});

api.omnibox.onInputEntered.addListener(async (text, disposition) => {
  let url = /^https?:\/\//.test(text) ? text : null;
  if (!url) {
    const found = await client.lookup(text, { locale: locale(), limit: 1 }).catch(unanswered);
    url = found.found ? found.entries[0].url : `${BASE}/?${new URLSearchParams({ search: text })}`;
  }
  if (!url.startsWith(BASE)) return;
  if (disposition === "currentTab") api.tabs.update({ url });
  else api.tabs.create({ url, active: disposition === "newForegroundTab" });
});
