import { DiagnosticModel } from "../models/DiagnosticModel";
import { getUnsyncedDiagnostics, markAsSynced } from "./databaseService";

const gatewayUrl = "https://api.agri-intell-ci.gouv.ci/v1/sync";

let syncCount = 0;
const listeners = new Set<(count: number) => void>();

function notify() {
  listeners.forEach((listener) => listener(syncCount));
}

async function postDiagnostic(diagnostic: DiagnosticModel) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: diagnostic.id,
        date: diagnostic.date,
        disease: diagnostic.disease,
        confidence: diagnostic.confidence,
        latitude: diagnostic.latitude,
        longitude: diagnostic.longitude,
        recommendation: diagnostic.recommendation,
        risk_level: diagnostic.riskLevel,
        is_synced: diagnostic.isSynced ? 1 : 0
      }),
      signal: controller.signal
    });
    return response.status === 200 || response.status === 201;
  } finally {
    clearTimeout(timeout);
  }
}

export function getSyncCount() {
  return syncCount;
}

export function subscribeToSync(listener: (count: number) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function synchronizeData() {
  try {
    const unsynced = await getUnsyncedDiagnostics();
    if (unsynced.length === 0) return true;

    for (const diagnostic of unsynced) {
      const success = await postDiagnostic(diagnostic);
      if (success && diagnostic.id) {
        await markAsSynced(diagnostic.id);
        syncCount += 1;
        notify();
      }
    }

    return true;
  } catch {
    return false;
  }
}
