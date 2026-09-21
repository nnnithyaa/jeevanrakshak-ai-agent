import type {
  BloodInventoryRow,
  CentreId,
  DemandForecast,
  ShortageRisk,
  ExpiryRisk,
  SurplusInfo,
  RedistributionRecommendation,
  AlternativeSource,
  RiskLevel,
  Priority,
  AgentDecision,
  FacilityDistance,
} from '@/types';
import { getDistance } from '@/data/simulatedData';

const FORECAST_HORIZON_DAYS = 3;
const SAFE_STOCK_RATIO = 1.5;
const NEAR_EXPIRY_DAYS = 5;
const EXPIRING_SOON_DAYS = 2;

// ── 1. PERCEIVE ──────────────────────────────────────────────
// The agent reads the simulated inventory state. This is a pass-through
// function kept for architectural clarity — in a real system it would
// fetch from sensors / databases.

export function perceive(inventory: BloodInventoryRow[]): BloodInventoryRow[] {
  return inventory.map((row) => ({ ...row }));
}

// ── 2. PREDICT DEMAND ─────────────────────────────────────────
// Prototype demand prediction using weighted moving average of daily
// consumption. Transparent and clearly labeled as simulated.

export function predictDemand(inventory: BloodInventoryRow[]): DemandForecast[] {
  return inventory.map((row) => {
    // Weighted average: recent consumption weighted more heavily
    // For prototype, dailyConsumption IS the recent average. We add a
    // small trend factor to simulate weighted-MA behavior.
    const base = row.dailyConsumption;
    const trendFactor = 1 + (row.dailyConsumption > 5 ? 0.1 : 0);
    const predictedDailyDemand = Math.round(base * trendFactor * 10) / 10;

    const totalPredictedDemand = Math.round(predictedDailyDemand * FORECAST_HORIZON_DAYS);
    const projectedStock = row.currentStock - totalPredictedDemand;
    const daysUntilDepletion =
      predictedDailyDemand > 0
        ? Math.round((row.currentStock / predictedDailyDemand) * 10) / 10
        : 999;

    return {
      inventoryId: row.id,
      centre: row.centre,
      centreId: row.centreId,
      bloodGroup: row.bloodGroup,
      component: row.component,
      currentStock: row.currentStock,
      predictedDailyDemand,
      forecastHorizonDays: FORECAST_HORIZON_DAYS,
      totalPredictedDemand,
      projectedStock,
      daysUntilDepletion,
      method: 'Prototype demand prediction — weighted moving average (simulated historical data)',
    };
  });
}

// ── 3. SHORTAGE RISK ──────────────────────────────────────────

export function calculateShortageRisk(
  inventory: BloodInventoryRow[],
  forecasts: DemandForecast[],
): ShortageRisk[] {
  return forecasts.map((f) => {
    const row = inventory.find((r) => r.id === f.inventoryId)!;
    const safeStock = Math.ceil(f.predictedDailyDemand * SAFE_STOCK_RATIO);
    const shortfall = Math.max(0, f.totalPredictedDemand + safeStock - f.currentStock);

    let riskLevel: RiskLevel;
    let predictedShortageDate: string | null = null;

    if (f.daysUntilDepletion <= 1) {
      riskLevel = 'CRITICAL';
    } else if (f.daysUntilDepletion <= FORECAST_HORIZON_DAYS) {
      riskLevel = 'HIGH';
    } else if (shortfall > 0) {
      riskLevel = 'MEDIUM';
    } else if (f.projectedStock < safeStock) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    if (f.daysUntilDepletion < 999) {
      const date = new Date();
      date.setDate(date.getDate() + Math.ceil(f.daysUntilDepletion));
      predictedShortageDate = date.toISOString().split('T')[0];
    }

    const explanation =
      riskLevel === 'LOW'
        ? `Stock of ${f.currentStock} units covers ${f.daysUntilDepletion} days of predicted demand (${f.predictedDailyDemand}/day). No shortage expected within ${FORECAST_HORIZON_DAYS} days.`
        : `Current stock ${f.currentStock} units vs predicted demand ${f.totalPredictedDemand} units over ${FORECAST_HORIZON_DAYS} days. Safe threshold is ${safeStock} units. Projected shortfall: ${shortfall} units. Stock depletes in ~${f.daysUntilDepletion} days.`;

    return {
      inventoryId: row.id,
      centre: f.centre,
      centreId: f.centreId,
      bloodGroup: f.bloodGroup,
      component: f.component,
      currentStock: f.currentStock,
      predictedDemand: f.totalPredictedDemand,
      shortfall,
      riskLevel,
      predictedShortageDate,
      explanation,
    };
  });
}

// ── 4. EXPIRY RISK ────────────────────────────────────────────

export function calculateExpiryRisk(inventory: BloodInventoryRow[]): ExpiryRisk[] {
  const today = new Date();
  return inventory.map((row) => {
    const expiry = new Date(row.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let level: ExpiryRisk['level'];
    if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
      level = 'Expiring Soon';
    } else if (daysUntilExpiry <= NEAR_EXPIRY_DAYS) {
      level = 'Near Expiry';
    } else {
      level = 'Normal';
    }

    return {
      inventoryId: row.id,
      centre: row.centre,
      centreId: row.centreId,
      bloodGroup: row.bloodGroup,
      component: row.component,
      currentStock: row.currentStock,
      expiryDate: row.expiryDate,
      daysUntilExpiry,
      level,
    };
  });
}

// ── 5. SURPLUS DETECTION ──────────────────────────────────────

export function detectSurplus(
  inventory: BloodInventoryRow[],
  forecasts: DemandForecast[],
): SurplusInfo[] {
  return forecasts
    .map((f) => {
      const row = inventory.find((r) => r.id === f.inventoryId)!;
      const safeStock = Math.ceil(f.predictedDailyDemand * SAFE_STOCK_RATIO);
      const surplus = f.currentStock - f.totalPredictedDemand - safeStock;
      return {
        inventoryId: row.id,
        centre: f.centre,
        centreId: f.centreId,
        bloodGroup: f.bloodGroup,
        component: f.component,
        currentStock: f.currentStock,
        predictedDemand: f.totalPredictedDemand,
        surplus: Math.max(0, surplus),
      };
    })
    .filter((s) => s.surplus > 0);
}

// ── 6. SMART REDISTRIBUTION DECISION ──────────────────────────
// Utility = shortageUrgency * shortageRiskWeight
//         + expiryRelevance * expiryWeight
//         + sourceSurplus * surplusWeight
//         + proximity * proximityWeight
//         - transportDelay * transportWeight

const WEIGHTS = {
  shortageRisk: 3.0,
  expiry: 1.5,
  surplus: 2.0,
  proximity: 1.0,
  transport: 0.5,
};

const riskScore: Record<RiskLevel, number> = {
  LOW: 0.2,
  MEDIUM: 0.5,
  HIGH: 0.8,
  CRITICAL: 1.0,
};

const riskToPriority: Record<RiskLevel, Priority> = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

function maxDistance(): number {
  return 70;
}
function maxTransport(): number {
  return 90;
}

export function generateRecommendations(
  inventory: BloodInventoryRow[],
  shortages: ShortageRisk[],
  surpluses: SurplusInfo[],
  expiryRisks: ExpiryRisk[],
): RedistributionRecommendation[] {
  const needyShortages = shortages.filter((s) => s.riskLevel !== 'LOW' && s.shortfall > 0);
  const recommendations: RedistributionRecommendation[] = [];

  for (const shortage of needyShortages) {
    // Find compatible surplus sources: same blood group + same component
    const compatibleSources = surpluses.filter(
      (s) =>
        s.bloodGroup === shortage.bloodGroup &&
        s.component === shortage.component &&
        s.centreId !== shortage.centreId,
    );

    if (compatibleSources.length === 0) continue;

    const expiry = expiryRisks.find((e) => e.inventoryId === shortage.inventoryId);
    const expiryRelevance =
      expiry && expiry.level !== 'Normal'
        ? expiry.level === 'Expiring Soon'
          ? 1.0
          : 0.6
        : 0.0;

    const shortageUrgency = riskScore[shortage.riskLevel];

    const candidates: AlternativeSource[] = compatibleSources
      .map((source) => {
        const dist = getDistance(source.centreId, shortage.centreId);
        if (!dist) return null;

        const proximity = 1 - dist.distanceKm / maxDistance();
        const transportDelay = dist.transportMinutes / maxTransport();

        const utility =
          shortageUrgency * WEIGHTS.shortageRisk * riskScore[shortage.riskLevel] +
          expiryRelevance * WEIGHTS.expiry +
          (source.surplus / 50) * WEIGHTS.surplus +
          proximity * WEIGHTS.proximity -
          transportDelay * WEIGHTS.transport;

        return {
          centre: source.centre,
          centreId: source.centreId,
          surplus: source.surplus,
          distanceKm: dist.distanceKm,
          transportMinutes: dist.transportMinutes,
          utility: Math.round(utility * 100) / 100,
        };
      })
      .filter((c): c is AlternativeSource => c !== null)
      .sort((a, b) => b.utility - a.utility);

    if (candidates.length === 0) continue;

    const best = candidates[0];
    const recommendedQuantity = Math.min(shortage.shortfall, best.surplus);

    const reason = `${shortage.centre} is predicted to face a shortage of ${shortage.shortfall} units of ${shortage.bloodGroup} ${shortage.component} within ${FORECAST_HORIZON_DAYS} days (risk: ${shortage.riskLevel}). ${best.centre} has ${best.surplus} units of surplus stock and is ${best.distanceKm} km away (~${best.transportMinutes} min transport). Utility score: ${best.utility}.`;

    recommendations.push({
      id: `rec-${shortage.inventoryId}-${best.centreId}`,
      sourceCentre: best.centre,
      sourceCentreId: best.centreId,
      destinationCentre: shortage.centre,
      destinationCentreId: shortage.centreId,
      bloodGroup: shortage.bloodGroup,
      component: shortage.component,
      recommendedQuantity,
      priority: riskToPriority[shortage.riskLevel],
      distanceKm: best.distanceKm,
      transportMinutes: best.transportMinutes,
      utility: best.utility,
      reason,
      factors: {
        shortageRisk: shortage.riskLevel,
        shortageUrgency: Math.round(shortageUrgency * 100) / 100,
        expiryRelevance: Math.round(expiryRelevance * 100) / 100,
        sourceSurplus: best.surplus,
        proximity: Math.round((1 - best.distanceKm / maxDistance()) * 100) / 100,
        transportDelay: Math.round((best.transportMinutes / maxTransport()) * 100) / 100,
      },
      alternatives: candidates.slice(1, 4),
      accepted: false,
    });
  }

  return recommendations.sort((a, b) => b.utility - a.utility);
}

// ── 7. FULL AGENT CYCLE ──────────────────────────────────────

export function runAgentCycle(inventory: BloodInventoryRow[]): AgentDecision {
  const perceived = perceive(inventory);
  const forecasts = predictDemand(perceived);
  const shortageRisks = calculateShortageRisk(perceived, forecasts);
  const expiryRisks = calculateExpiryRisk(perceived);
  const surpluses = detectSurplus(perceived, forecasts);
  const recommendations = generateRecommendations(perceived, shortageRisks, surpluses, expiryRisks);

  return {
    forecasts,
    shortageRisks,
    expiryRisks,
    surpluses,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

// ── 9. UPDATE STATE (Simulated) ───────────────────────────────

export function applyRecommendation(
  inventory: BloodInventoryRow[],
  rec: RedistributionRecommendation,
): BloodInventoryRow[] {
  return inventory.map((row) => {
    if (row.centreId === rec.sourceCentreId && row.bloodGroup === rec.bloodGroup && row.component === rec.component) {
      return { ...row, currentStock: row.currentStock - rec.recommendedQuantity };
    }
    if (row.centreId === rec.destinationCentreId && row.bloodGroup === rec.bloodGroup && row.component === rec.component) {
      return { ...row, currentStock: row.currentStock + rec.recommendedQuantity };
    }
    return row;
  });
}
