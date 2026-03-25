import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { join, resolve } from "node:path";

function nowCtParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function timestampCt() {
  const p = nowCtParts();
  return `${p.year}${p.month}${p.day}_${p.hour}${p.minute}${p.second}_CT`;
}

function dateCt() {
  const p = nowCtParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function labelCt() {
  const p = nowCtParts();
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} CT`;
}

function sanitizeSegment(value) {
  return (
    String(value || "unknown")
      .trim()
      .replace(/[^A-Za-z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "unknown"
  );
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function maybeReadJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function loadFramework(repoRoot) {
  const configPath = resolve(repoRoot, "config", "recurrence-framework.v1.json");
  const parsed = JSON.parse(readFileSync(configPath, "utf-8"));
  return parsed;
}

function artifactRootFor(repoRoot, framework) {
  return join(repoRoot, ...(framework.artifact_root || "artifacts/governance/recurrence-control").split("/"));
}

function latestPathFor(latestDir, recurrenceKey) {
  return join(latestDir, `latest__${sanitizeSegment(recurrenceKey)}.json`);
}

function uniqueEventFileName({
  timestampCtValue,
  stage,
  status,
  requestId,
  finishedAtMs,
  eventDir,
}) {
  const suffix = sanitizeSegment(requestId || `${finishedAtMs}-${randomUUID().slice(0, 8)}`);
  const candidate = `${timestampCtValue}__${sanitizeSegment(stage)}__${sanitizeSegment(status)}__${suffix}.json`;
  if (!existsSync(join(eventDir, candidate))) {
    return candidate;
  }
  return `${timestampCtValue}__${sanitizeSegment(stage)}__${sanitizeSegment(status)}__${suffix}_${randomUUID().slice(0, 6)}.json`;
}

function normalizeStage(stage, framework) {
  const normalized = sanitizeSegment(stage).toLowerCase();
  if (!framework.stages.includes(normalized)) {
    throw new Error(
      `Invalid recurrence stage "${stage}". Allowed: ${framework.stages.join(", ")}`
    );
  }
  return normalized;
}

function normalizeSeverity(severity, framework) {
  const normalized = sanitizeSegment(severity || "medium").toLowerCase();
  if (!framework.severity_levels.includes(normalized)) {
    throw new Error(
      `Invalid recurrence severity "${severity}". Allowed: ${framework.severity_levels.join(", ")}`
    );
  }
  return normalized;
}

export function persistRecurrenceRecord({
  repoRoot = process.cwd(),
  recurrenceKey,
  moduleId,
  stage,
  summary,
  status = "open",
  severity = "medium",
  eventType = null,
  family = null,
  classId = null,
  actionId = null,
  requestId = null,
  startedAtMs = Date.now(),
  finishedAtMs = Date.now(),
  evidence = {},
  artifacts = {},
  metadata = {},
}) {
  if (!recurrenceKey || !moduleId || !stage || !summary) {
    throw new Error("recurrenceKey, moduleId, stage, and summary are required");
  }

  const framework = loadFramework(repoRoot);
  const normalizedStage = normalizeStage(stage, framework);
  const normalizedSeverity = normalizeSeverity(severity, framework);
  const baseDir = artifactRootFor(repoRoot, framework);
  const eventDir = join(baseDir, "events", sanitizeSegment(recurrenceKey));
  const latestDir = join(baseDir, "latest");
  const ledgerDir = join(baseDir, "ledger");
  ensureDir(eventDir);
  ensureDir(latestDir);
  ensureDir(ledgerDir);

  const ts = timestampCt();
  const day = dateCt();
  const previousLatest = maybeReadJson(latestPathFor(latestDir, recurrenceKey));
  const event = {
    schema_version: framework.schema_version,
    framework_id: framework.framework_id,
    recurrence_key: recurrenceKey,
    module_id: moduleId,
    stage: normalizedStage,
    status,
    severity: normalizedSeverity,
    event_type: eventType,
    family,
    class_id: classId,
    summary,
    action_id: actionId,
    request_id: requestId,
    timestamp_ct: ts,
    generated_at_ct: labelCt(),
    generated_at_utc: new Date(finishedAtMs).toISOString(),
    started_at_utc: new Date(startedAtMs).toISOString(),
    finished_at_utc: new Date(finishedAtMs).toISOString(),
    duration_ms: Math.max(0, finishedAtMs - startedAtMs),
    evidence,
    artifacts,
    metadata,
    promotion_rules: framework.promotion_rules,
  };

  const timestampedPath = join(
    eventDir,
    uniqueEventFileName({
      timestampCtValue: ts,
      stage: normalizedStage,
      status,
      requestId,
      finishedAtMs,
      eventDir,
    })
  );
  const latestPath = latestPathFor(latestDir, recurrenceKey);
  const ledgerPath = join(ledgerDir, `${day}.jsonl`);

  writeFileSync(timestampedPath, `${JSON.stringify(event, null, 2)}\n`, "utf-8");
  writeFileSync(latestPath, `${JSON.stringify(event, null, 2)}\n`, "utf-8");
  appendFileSync(ledgerPath, `${JSON.stringify(event)}\n`, "utf-8");

  return {
    ...event,
    persistence: {
      timestamped_path: timestampedPath,
      latest_path: latestPath,
      ledger_path: ledgerPath,
      previous_latest: previousLatest,
    },
  };
}

export function safePersistRecurrenceRecord(params) {
  try {
    return persistRecurrenceRecord(params);
  } catch (error) {
    console.error(
      `[recurrence-control] failed for ${params?.recurrenceKey || "unknown"}: ${
        error?.message || String(error)
      }`
    );
    return null;
  }
}
