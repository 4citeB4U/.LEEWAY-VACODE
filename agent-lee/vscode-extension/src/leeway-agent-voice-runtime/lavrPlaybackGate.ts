/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: VOICE_RUNTIME
TAG: CORE.AGENT_LEE.LEEWAY_AGENT_VOICE_RUNTIME.PLAYBACK_GATE
PURPOSE: Local playback/TTS interrupt gate for LeeWay Agent Voice Runtime.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

export type LavrPlaybackEventType =
  | "LAVR_PLAYBACK_STARTED"
  | "LAVR_PLAYBACK_SEGMENT_QUEUED"
  | "LAVR_PLAYBACK_STOP_REQUESTED"
  | "LAVR_PLAYBACK_STOPPED"
  | "LAVR_PLAYBACK_CANCELLED"
  | "LAVR_PLAYBACK_COMPLETED"
  | "LAVR_PLAYBACK_STALE_SEGMENT_SUPPRESSED"
  | "LAVR_PLAYBACK_DUPLICATE_STOP_SUPPRESSED";

export type LavrPlaybackRecord = {
  eventType: LavrPlaybackEventType;
  lavrPlaybackId: string;
  lavrSpeechOutputId: string;
  lavrSessionId: string;
  lavrTurnId: string;
  lavrAudioSegmentId?: string;
  reason?: string;
  queuedSegments?: number;
  completedSegments?: number;
};

export type LavrPlaybackEntry = {
  lavrPlaybackId: string;
  lavrSpeechOutputId: string;
  lavrSessionId: string;
  lavrTurnId: string;
  queuedSegmentIds: string[];
  completedSegmentIds: Set<string>;
  status: "active" | "stopped" | "cancelled" | "completed";
  stopRequested: boolean;
  terminalEmitted: boolean;
  createdAt: number;
};

export type LavrPlaybackGateOptions = {
  now?: () => number;
  createId?: (prefix: string) => string;
  onLifecycle?: (record: LavrPlaybackRecord) => void;
};

function defaultCreateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class LavrPlaybackGate {
  private readonly now: () => number;
  private readonly createId: (prefix: string) => string;
  private readonly onLifecycle?: (record: LavrPlaybackRecord) => void;
  private activePlaybackId = "";
  private readonly byPlaybackId = new Map<string, LavrPlaybackEntry>();

  constructor(options?: LavrPlaybackGateOptions) {
    this.now = options?.now || (() => Date.now());
    this.createId = options?.createId || defaultCreateId;
    this.onLifecycle = options?.onLifecycle;
  }

  getActivePlaybackId() {
    return this.activePlaybackId;
  }

  getPlayback(playbackId: string) {
    return this.byPlaybackId.get(String(playbackId || ""));
  }

  startPlayback(input: { lavrSessionId: string; lavrTurnId: string; lavrSpeechOutputId?: string }) {
    if (this.activePlaybackId) {
      this.cancelPlayback(this.activePlaybackId, "replaced_by_new_playback");
    }

    const lavrPlaybackId = this.createId("lavr-pb");
    const lavrSpeechOutputId = String(input.lavrSpeechOutputId || this.createId("lavr-sout"));
    const entry: LavrPlaybackEntry = {
      lavrPlaybackId,
      lavrSpeechOutputId,
      lavrSessionId: String(input.lavrSessionId || ""),
      lavrTurnId: String(input.lavrTurnId || ""),
      queuedSegmentIds: [],
      completedSegmentIds: new Set<string>(),
      status: "active",
      stopRequested: false,
      terminalEmitted: false,
      createdAt: this.now()
    };

    this.byPlaybackId.set(lavrPlaybackId, entry);
    this.activePlaybackId = lavrPlaybackId;
    this.emit({
      eventType: "LAVR_PLAYBACK_STARTED",
      lavrPlaybackId,
      lavrSpeechOutputId,
      lavrSessionId: entry.lavrSessionId,
      lavrTurnId: entry.lavrTurnId
    });

    return entry;
  }

  queueSegment(playbackId: string, segmentId?: string) {
    const entry = this.byPlaybackId.get(String(playbackId || ""));
    if (!entry || entry.status !== "active" || this.activePlaybackId !== entry.lavrPlaybackId) {
      this.emit({
        eventType: "LAVR_PLAYBACK_STALE_SEGMENT_SUPPRESSED",
        lavrPlaybackId: String(playbackId || ""),
        lavrSpeechOutputId: entry?.lavrSpeechOutputId || "",
        lavrSessionId: entry?.lavrSessionId || "",
        lavrTurnId: entry?.lavrTurnId || "",
        lavrAudioSegmentId: String(segmentId || ""),
        reason: "queue_segment_for_inactive_playback"
      });
      return null;
    }

    const lavrAudioSegmentId = String(segmentId || this.createId("lavr-seg"));
    entry.queuedSegmentIds.push(lavrAudioSegmentId);
    this.emit({
      eventType: "LAVR_PLAYBACK_SEGMENT_QUEUED",
      lavrPlaybackId: entry.lavrPlaybackId,
      lavrSpeechOutputId: entry.lavrSpeechOutputId,
      lavrSessionId: entry.lavrSessionId,
      lavrTurnId: entry.lavrTurnId,
      lavrAudioSegmentId,
      queuedSegments: entry.queuedSegmentIds.length,
      completedSegments: entry.completedSegmentIds.size
    });
    return lavrAudioSegmentId;
  }

  completeSegment(playbackId: string, segmentId: string) {
    const entry = this.byPlaybackId.get(String(playbackId || ""));
    if (!entry || entry.status !== "active" || this.activePlaybackId !== entry.lavrPlaybackId) {
      this.emit({
        eventType: "LAVR_PLAYBACK_STALE_SEGMENT_SUPPRESSED",
        lavrPlaybackId: String(playbackId || ""),
        lavrSpeechOutputId: entry?.lavrSpeechOutputId || "",
        lavrSessionId: entry?.lavrSessionId || "",
        lavrTurnId: entry?.lavrTurnId || "",
        lavrAudioSegmentId: String(segmentId || ""),
        reason: "segment_complete_for_inactive_playback"
      });
      return false;
    }

    const safeSegmentId = String(segmentId || "");
    if (!safeSegmentId || !entry.queuedSegmentIds.includes(safeSegmentId)) {
      return false;
    }

    entry.completedSegmentIds.add(safeSegmentId);
    if (entry.completedSegmentIds.size >= entry.queuedSegmentIds.length) {
      entry.status = "completed";
      if (this.activePlaybackId === entry.lavrPlaybackId) this.activePlaybackId = "";
      if (!entry.terminalEmitted) {
        entry.terminalEmitted = true;
        this.emit({
          eventType: "LAVR_PLAYBACK_COMPLETED",
          lavrPlaybackId: entry.lavrPlaybackId,
          lavrSpeechOutputId: entry.lavrSpeechOutputId,
          lavrSessionId: entry.lavrSessionId,
          lavrTurnId: entry.lavrTurnId,
          queuedSegments: entry.queuedSegmentIds.length,
          completedSegments: entry.completedSegmentIds.size
        });
      }
    }
    return true;
  }

  requestStop(playbackId: string, reason: string) {
    const entry = this.byPlaybackId.get(String(playbackId || ""));
    if (!entry) return false;

    if (entry.stopRequested || entry.status !== "active") {
      this.emit({
        eventType: "LAVR_PLAYBACK_DUPLICATE_STOP_SUPPRESSED",
        lavrPlaybackId: entry.lavrPlaybackId,
        lavrSpeechOutputId: entry.lavrSpeechOutputId,
        lavrSessionId: entry.lavrSessionId,
        lavrTurnId: entry.lavrTurnId,
        reason: String(reason || "duplicate_stop")
      });
      return false;
    }

    entry.stopRequested = true;
    this.emit({
      eventType: "LAVR_PLAYBACK_STOP_REQUESTED",
      lavrPlaybackId: entry.lavrPlaybackId,
      lavrSpeechOutputId: entry.lavrSpeechOutputId,
      lavrSessionId: entry.lavrSessionId,
      lavrTurnId: entry.lavrTurnId,
      reason: String(reason || "stop_requested")
    });

    entry.status = "stopped";
    if (this.activePlaybackId === entry.lavrPlaybackId) this.activePlaybackId = "";
    if (!entry.terminalEmitted) {
      entry.terminalEmitted = true;
      this.emit({
        eventType: "LAVR_PLAYBACK_STOPPED",
        lavrPlaybackId: entry.lavrPlaybackId,
        lavrSpeechOutputId: entry.lavrSpeechOutputId,
        lavrSessionId: entry.lavrSessionId,
        lavrTurnId: entry.lavrTurnId,
        reason: String(reason || "stop_requested")
      });
    }
    return true;
  }

  cancelPlayback(playbackId: string, reason: string) {
    const entry = this.byPlaybackId.get(String(playbackId || ""));
    if (!entry) return false;

    if (entry.stopRequested || entry.status !== "active") {
      this.emit({
        eventType: "LAVR_PLAYBACK_DUPLICATE_STOP_SUPPRESSED",
        lavrPlaybackId: entry.lavrPlaybackId,
        lavrSpeechOutputId: entry.lavrSpeechOutputId,
        lavrSessionId: entry.lavrSessionId,
        lavrTurnId: entry.lavrTurnId,
        reason: String(reason || "duplicate_cancel")
      });
      return false;
    }

    entry.stopRequested = true;
    this.emit({
      eventType: "LAVR_PLAYBACK_STOP_REQUESTED",
      lavrPlaybackId: entry.lavrPlaybackId,
      lavrSpeechOutputId: entry.lavrSpeechOutputId,
      lavrSessionId: entry.lavrSessionId,
      lavrTurnId: entry.lavrTurnId,
      reason: String(reason || "cancel_requested")
    });

    entry.status = "cancelled";
    if (this.activePlaybackId === entry.lavrPlaybackId) this.activePlaybackId = "";
    if (!entry.terminalEmitted) {
      entry.terminalEmitted = true;
      this.emit({
        eventType: "LAVR_PLAYBACK_CANCELLED",
        lavrPlaybackId: entry.lavrPlaybackId,
        lavrSpeechOutputId: entry.lavrSpeechOutputId,
        lavrSessionId: entry.lavrSessionId,
        lavrTurnId: entry.lavrTurnId,
        reason: String(reason || "cancel_requested")
      });
    }
    return true;
  }

  private emit(record: LavrPlaybackRecord) {
    try {
      this.onLifecycle?.(record);
    } catch {
      // Keep playback gate resilient even if lifecycle observers fail.
    }
  }
}
