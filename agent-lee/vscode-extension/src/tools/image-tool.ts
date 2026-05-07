import * as fs from "fs";

export async function analyzeImage(path: string, model = "llava:7b") {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      model,
      stream: false,
      prompt: "Analyze this image for a developer. Summarize UI, text, structure, possible code relevance, and issues.",
      images: [fs.readFileSync(path, {encoding:"base64"})]
    })
  });

  const data:any = await response.json();
  return data.response || "No image response.";
}
