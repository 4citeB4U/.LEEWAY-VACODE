"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImage = analyzeImage;
async function analyzeImage(path) {
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llava:7b",
            prompt: "Describe this image in detail for a developer.",
            images: [require("fs").readFileSync(path, { encoding: "base64" })]
        })
    });
    const data = await response.json();
    return data.response;
}
//# sourceMappingURL=image-tool.js.map