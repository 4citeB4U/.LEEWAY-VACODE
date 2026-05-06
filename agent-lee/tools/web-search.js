"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSearch = webSearch;
async function webSearch(query) {
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    return "Search results retrieved. (Expand with API later)";
}
//# sourceMappingURL=web-search.js.map