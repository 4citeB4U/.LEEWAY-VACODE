export async function webSearch(query: string) {
  const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
  return "Search results retrieved. (Expand with API later)";
}
