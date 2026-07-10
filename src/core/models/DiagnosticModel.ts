export type DiagnosticModel = {
  id?: number;
  date: string;
  disease: string;
  confidence: number;
  latitude: number;
  longitude: number;
  recommendation: string;
  riskLevel: string;
  isSynced: boolean;
};

export type DiagnosticRow = {
  id: number;
  date: string;
  disease: string;
  confidence: number;
  latitude: number;
  longitude: number;
  recommendation: string;
  risk_level: string;
  is_synced: number;
};

export function diagnosticToRow(diagnostic: DiagnosticModel) {
  return {
    $date: diagnostic.date,
    $disease: diagnostic.disease,
    $confidence: diagnostic.confidence,
    $latitude: diagnostic.latitude,
    $longitude: diagnostic.longitude,
    $recommendation: diagnostic.recommendation,
    $risk_level: diagnostic.riskLevel,
    $is_synced: diagnostic.isSynced ? 1 : 0
  };
}

export function diagnosticFromRow(row: DiagnosticRow): DiagnosticModel {
  return {
    id: row.id,
    date: row.date,
    disease: row.disease,
    confidence: row.confidence,
    latitude: row.latitude,
    longitude: row.longitude,
    recommendation: row.recommendation,
    riskLevel: row.risk_level,
    isSynced: row.is_synced === 1
  };
}
