/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: 🟢 CORE
TAG: CORE.VISUAL.RUNTIME.QUALITY_GATE
PURPOSE: Quality gate helpers for LVIS workflow thresholds and validation posture.
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
*/

import { LVIS_QUALITY_GATES } from "../system/LVIS.constants";
import type { VisualAssetKind } from "../system/LVIS.schemas";

export function minimumScoreFor(kind: VisualAssetKind) {
  return kind === "svg" ? LVIS_QUALITY_GATES.svg : kind === "voxel" ? LVIS_QUALITY_GATES.voxel : LVIS_QUALITY_GATES.scene;
}

export function passesQualityGate(kind: VisualAssetKind, score: number) {
  return score >= minimumScoreFor(kind);
}
