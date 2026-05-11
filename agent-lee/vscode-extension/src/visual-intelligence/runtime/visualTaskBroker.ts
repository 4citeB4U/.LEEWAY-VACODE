/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.VISUAL.RUNTIME.TASK_BROKER
PURPOSE: Executes LVIS workflows by routing tasks to governed workers and collecting outputs.
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
*/

import type { VisualWorkflowId } from "../system/LVIS.schemas";
import { runAssetRepairWorker } from "../workers/asset-repair/assetRepair.worker";
import { runDepthSynthesisWorker } from "../workers/depth-synthesis/depthSynthesis.worker";
import { runManifestExportWorker } from "../workers/manifest-export/manifestExport.worker";
import { runProjectIntegrationWorker } from "../workers/project-integration/projectIntegration.worker";
import { runSceneReconstructionWorker } from "../workers/scene-reconstruction/sceneReconstruction.worker";
import { runStructuralFidelityWorker } from "../workers/structural-fidelity/structuralFidelity.worker";
import { runVectorReconstructionWorker } from "../workers/vector-reconstruction/vectorReconstruction.worker";
import { runVisualMemoryWorker } from "../workers/visual-memory/visualMemory.worker";
import { runVoxelReconstructionWorker } from "../workers/voxel-reconstruction/voxelReconstruction.worker";

export async function runVisualTaskBroker(workflow: VisualWorkflowId, payload: any) {
  switch (workflow) {
    case "image-to-svg":
      return runVectorReconstructionWorker(payload);
    case "image-to-voxel":
    case "svg-to-voxel":
      return runVoxelReconstructionWorker(payload);
    case "asset-to-project":
      return runProjectIntegrationWorker(payload);
    case "scene-reconstruction":
      return runSceneReconstructionWorker(payload);
    default:
      return {
        depth: await runDepthSynthesisWorker(payload),
        fidelity: await runStructuralFidelityWorker({ source: JSON.stringify(payload), candidate: JSON.stringify(payload) }),
        repair: await runAssetRepairWorker({ kind: "svg", candidate: JSON.stringify(payload), score: 75 }),
        memory: await runVisualMemoryWorker({ key: "last-run", value: { workflow } }),
        export: payload.outputRoot && payload.assetPackage && payload.receipt ? await runManifestExportWorker(payload) : null
      };
  }
}
