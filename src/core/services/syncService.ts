// La synchronisation distante reste volontairement désactivée. Un endpoint
// public sans authentification ne doit jamais recevoir des données agricoles.
let syncCount = 0;
const listeners = new Set<(count: number) => void>();

export function getSyncCount() {
  return syncCount;
}

export function subscribeToSync(listener: (count: number) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function synchronizeData(): Promise<{ ok: false; message: string }> {
  return {
    ok: false,
    message: "Synchronisation désactivée : une API authentifiée et auditée est requise avant tout transfert de données."
  };
}
