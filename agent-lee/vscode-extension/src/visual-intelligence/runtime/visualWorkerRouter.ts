/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.VISUAL.RUNTIME.WORKER_ROUTER
PURPOSE: Maps LVIS tool IDs and worker IDs to owned worker surfaces under Leeway governance.
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
*/

export const VISUAL_TOOL_REGISTRY = {
  "visual.vector.analyzeImage": "leeway-vector-reconstruction-worker",
  "visual.vector.traceCandidates": "leeway-vector-reconstruction-worker",
  "visual.vector.exportTsx": "leeway-vector-reconstruction-worker",
  "visual.voxel.imageToVoxel": "leeway-voxel-reconstruction-worker",
  "visual.voxel.svgToVoxel": "leeway-voxel-reconstruction-worker",
  "visual.depth.estimateDepth": "leeway-depth-synthesis-worker",
  "visual.scene.createSceneGraph": "leeway-scene-reconstruction-worker",
  "visual.fidelity.scoreAsset": "leeway-structural-fidelity-worker",
  "visual.repair.retryCandidate": "leeway-asset-repair-worker",
  "visual.export.packageAsset": "leeway-manifest-export-worker",
  "visual.integration.createPendingEdits": "leeway-project-integration-worker",
  "visual.memory.savePreset": "leeway-visual-memory-worker"
} as const;

export function resolveVisualToolOwner(toolId: string) {
  return VISUAL_TOOL_REGISTRY[toolId as keyof typeof VISUAL_TOOL_REGISTRY] || "leeway-visual-orchestrator-agent";
}
