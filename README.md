# Zero Parades lookup

Browser extension for ZERO PARADES: For Dead Spies. Select a skill, thought, item, character or place name on any page, choose "Look up in Zero Parades" from the context menu, and a small window shows the entry as https://zeroparadesdb.com shows it (icon, facts, description) with a link to its page. In the address bar, `zp` followed by a name suggests entries and opens the chosen page. The extension answers in the browser's language where the game has it.

Only the selected or typed text is sent, to zeroparadesdb.com. Permissions: `contextMenus` and access to zeroparadesdb.com.

## Build

```sh
npm run build
```

`dist/chromium` loads unpacked in Chrome, Edge, Brave, Vivaldi and Opera; `dist/firefox` loads as a temporary add-on in Firefox.
