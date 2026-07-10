import * as SQLite from "expo-sqlite";
import {
  DiagnosticModel,
  DiagnosticRow,
  diagnosticFromRow,
  diagnosticToRow
} from "../models/DiagnosticModel";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("agri_intell.db");
  }
  const db = await databasePromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS diagnostics(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      disease TEXT,
      confidence REAL,
      latitude REAL,
      longitude REAL,
      recommendation TEXT,
      risk_level TEXT,
      is_synced INTEGER
    );
  `);
  return db;
}

export async function initializeDatabase() {
  await getDatabase();
}

export async function insertDiagnostic(diagnostic: DiagnosticModel) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO diagnostics
      (date, disease, confidence, latitude, longitude, recommendation, risk_level, is_synced)
     VALUES ($date, $disease, $confidence, $latitude, $longitude, $recommendation, $risk_level, $is_synced)`,
    diagnosticToRow(diagnostic)
  );
  return result.lastInsertRowId;
}

export async function getUnsyncedDiagnostics() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiagnosticRow>(
    "SELECT * FROM diagnostics WHERE is_synced = ? ORDER BY id DESC",
    [0]
  );
  return rows.map(diagnosticFromRow);
}

export async function getAllDiagnostics() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiagnosticRow>("SELECT * FROM diagnostics ORDER BY id DESC");
  return rows.map(diagnosticFromRow);
}

export async function markAsSynced(id: number) {
  const db = await getDatabase();
  return db.runAsync("UPDATE diagnostics SET is_synced = 1 WHERE id = ?", [id]);
}
