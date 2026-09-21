export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export type BloodComponent = 'Packed RBC' | 'Platelets' | 'Fresh Frozen Plasma';

export type StockStatus = 'Adequate' | 'Low' | 'Critical' | 'Near Expiry';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type CentreId = 'A' | 'B' | 'C' | 'D';

export interface BloodInventoryRow {
  id: string;
  centre: string;
  centreId: CentreId;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  currentStock: number;
  dailyConsumption: number;
  expiryDate: string;
  status: StockStatus;
}

export interface BloodAvailability {
  bloodGroup: BloodGroup;
  currentStock: number;
  capacity: number;
  status: StockStatus;
}

export interface AIAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  centre: string;
  description: string;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  type: 'inventory' | 'prediction' | 'redistribution' | 'emergency';
  message: string;
  timestamp: string;
}

export interface DemandDataPoint {
  day: string;
  O_pos: number;
  A_pos: number;
  B_pos: number;
  AB_pos: number;
  O_neg: number;
}

export type PageId =
  | 'dashboard'
  | 'inventory'
  | 'predictions'
  | 'shortage'
  | 'redistribution'
  | 'emergency'
  | 'simulation';

// ── Agent Types ──────────────────────────────────────────────

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ExpiryLevel = 'Normal' | 'Near Expiry' | 'Expiring Soon';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DemandForecast {
  inventoryId: string;
  centre: string;
  centreId: CentreId;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  currentStock: number;
  predictedDailyDemand: number;
  forecastHorizonDays: number;
  totalPredictedDemand: number;
  projectedStock: number;
  daysUntilDepletion: number;
  method: string;
}

export interface ShortageRisk {
  inventoryId: string;
  centre: string;
  centreId: CentreId;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  currentStock: number;
  predictedDemand: number;
  shortfall: number;
  riskLevel: RiskLevel;
  predictedShortageDate: string | null;
  explanation: string;
}

export interface ExpiryRisk {
  inventoryId: string;
  centre: string;
  centreId: CentreId;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  currentStock: number;
  expiryDate: string;
  daysUntilExpiry: number;
  level: ExpiryLevel;
}

export interface SurplusInfo {
  inventoryId: string;
  centre: string;
  centreId: CentreId;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  currentStock: number;
  predictedDemand: number;
  surplus: number;
}

export interface FacilityDistance {
  from: CentreId;
  to: CentreId;
  distanceKm: number;
  transportMinutes: number;
}

export interface AlternativeSource {
  centre: string;
  centreId: CentreId;
  surplus: number;
  distanceKm: number;
  transportMinutes: number;
  utility: number;
}

export interface RedistributionRecommendation {
  id: string;
  sourceCentre: string;
  sourceCentreId: CentreId;
  destinationCentre: string;
  destinationCentreId: CentreId;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  recommendedQuantity: number;
  priority: Priority;
  distanceKm: number;
  transportMinutes: number;
  utility: number;
  reason: string;
  factors: {
    shortageRisk: RiskLevel;
    shortageUrgency: number;
    expiryRelevance: number;
    sourceSurplus: number;
    proximity: number;
    transportDelay: number;
  };
  alternatives: AlternativeSource[];
  accepted: boolean;
}

export interface AgentDecision {
  forecasts: DemandForecast[];
  shortageRisks: ShortageRisk[];
  expiryRisks: ExpiryRisk[];
  surpluses: SurplusInfo[];
  recommendations: RedistributionRecommendation[];
  generatedAt: string;
}

export interface AgentState {
  inventory: BloodInventoryRow[];
  decision: AgentDecision | null;
  cycleCount: number;
}
