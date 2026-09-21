import type {
  BloodInventoryRow,
  BloodGroup,
  BloodComponent,
  CentreId,
  ExpiryLevel,
  Priority,
} from '@/types';
import { getDistance, CENTRES } from '@/data/simulatedData';

export type EmergencyUrgency = 'Critical' | 'High' | 'Medium';

export interface EmergencyRequest {
  id: string;
  hospital: string;
  location: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  quantity: number;
  urgency: EmergencyUrgency;
  timestamp: string;
}

export interface EmergencySourceCandidate {
  centreId: CentreId;
  centre: string;
  availableStock: number;
  transferableQuantity: number;
  distanceKm: number;
  transportMinutes: number;
  expiryLevel: ExpiryLevel;
  daysUntilExpiry: number;
  utility: number;
  factors: {
    availability: number;
    surplus: number;
    distance: number;
    transport: number;
    expiry: number;
    urgency: number;
  };
  recommended: boolean;
}

export interface EmergencyResult {
  request: EmergencyRequest;
  candidates: EmergencySourceCandidate[];
  recommended: EmergencySourceCandidate | null;
  reason: string;
  fulfilled: boolean;
}

const urgencyScore: Record<EmergencyUrgency, number> = {
  Critical: 1.0,
  High: 0.7,
  Medium: 0.4,
};

const urgencyToPriority: Record<EmergencyUrgency, Priority> = {
  Critical: 'CRITICAL',
  High: 'HIGH',
  Medium: 'MEDIUM',
};

const E_WEIGHTS = {
  availability: 3.0,
  surplus: 2.0,
  distance: 1.5,
  transport: 1.0,
  expiry: 1.0,
  urgency: 2.5,
};

const MAX_DISTANCE = 70;
const MAX_TRANSPORT = 90;

function getExpiryForRow(row: BloodInventoryRow): { level: ExpiryLevel; daysUntilExpiry: number } {
  const today = new Date();
  const expiry = new Date(row.expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let level: ExpiryLevel;
  if (daysUntilExpiry <= 2) level = 'Expiring Soon';
  else if (daysUntilExpiry <= 5) level = 'Near Expiry';
  else level = 'Normal';
  return { level, daysUntilExpiry };
}

// Destination is a hospital (not a centre), so we compute distance from
// each source centre to the nearest centre as a proxy. For simplicity we
// use the first centre as a reference point for the hospital location.
function getDistanceToHospital(sourceId: CentreId, location: string): { distanceKm: number; transportMinutes: number } {
  // Try to match location to a centre name keyword
  const match = CENTRES.find((c) => location.toLowerCase().includes(c.id.toLowerCase()));
  const targetId = match?.id || 'A';
  const dist = getDistance(sourceId, targetId);
  if (dist) return { distanceKm: dist.distanceKm, transportMinutes: dist.transportMinutes };
  // Fallback: use average distance
  return { distanceKm: 50, transportMinutes: 65 };
}

export function evaluateEmergencyRequest(
  request: EmergencyRequest,
  inventory: BloodInventoryRow[],
): EmergencyResult {
  const urgency = urgencyScore[request.urgency];

  // Find all inventory rows matching blood group + component
  const matchingRows = inventory.filter(
    (r) => r.bloodGroup === request.bloodGroup && r.component === request.component && r.currentStock > 0,
  );

  const candidates: EmergencySourceCandidate[] = matchingRows
    .map((row) => {
      const { level: expiryLevel, daysUntilExpiry } = getExpiryForRow(row);
      const { distanceKm, transportMinutes } = getDistanceToHospital(row.centreId, request.location);

      // How much can this source provide?
      const transferableQuantity = Math.min(row.currentStock, request.quantity);

      // Availability score: can they fulfill the full request?
      const availability = row.currentStock >= request.quantity ? 1.0 : row.currentStock / request.quantity;

      // Surplus: stock above a safe threshold (1.5 * daily consumption)
      const safeStock = Math.ceil(row.dailyConsumption * 1.5);
      const surplus = Math.max(0, row.currentStock - safeStock);
      const surplusScore = Math.min(1, surplus / 30);

      // Distance/transport normalized (closer = higher score)
      const distanceScore = 1 - distanceKm / MAX_DISTANCE;
      const transportScore = 1 - transportMinutes / MAX_TRANSPORT;

      // Expiry: prefer stock with more days until expiry
      const expiryScore = Math.min(1, daysUntilExpiry / 30);

      const utility =
        availability * E_WEIGHTS.availability +
        surplusScore * E_WEIGHTS.surplus +
        distanceScore * E_WEIGHTS.distance +
        transportScore * E_WEIGHTS.transport +
        expiryScore * E_WEIGHTS.expiry +
        urgency * E_WEIGHTS.urgency;

      return {
        centreId: row.centreId,
        centre: row.centre,
        availableStock: row.currentStock,
        transferableQuantity,
        distanceKm,
        transportMinutes,
        expiryLevel,
        daysUntilExpiry,
        utility: Math.round(utility * 100) / 100,
        factors: {
          availability: Math.round(availability * 100) / 100,
          surplus: surplus,
          distance: Math.round(distanceScore * 100) / 100,
          transport: Math.round(transportScore * 100) / 100,
          expiry: Math.round(expiryScore * 100) / 100,
          urgency: Math.round(urgency * 100) / 100,
        },
        recommended: false,
      };
    })
    .sort((a, b) => b.utility - a.utility);

  // Mark the best candidate as recommended
  if (candidates.length > 0) {
    candidates[0].recommended = true;
  }

  const recommended = candidates.length > 0 ? candidates[0] : null;
  const fulfilled = recommended !== null && recommended.transferableQuantity >= request.quantity;

  let reason: string;
  if (!recommended) {
    reason = `No simulated centre currently has ${request.bloodGroup} ${request.component} stock available to fulfill this request.`;
  } else {
    const exp = recommended.expiryLevel === 'Normal'
      ? `with an acceptable expiry window (${recommended.daysUntilExpiry} days remaining)`
      : `though expiry risk should be noted (${recommended.expiryLevel}, ${recommended.daysUntilExpiry} days remaining)`;

    const distPhrase = candidates.length > 1
      ? `the shortest estimated transport time among suitable sources`
      : `the only available source`;

    reason = `${recommended.centre} was selected because it has sufficient ${request.bloodGroup} ${request.component} stock (${recommended.availableStock} units available, ${recommended.transferableQuantity} transferable), ${distPhrase} (${recommended.transportMinutes} min), ${exp}, and a utility score of ${recommended.utility}.`;
  }

  return {
    request,
    candidates,
    recommended,
    reason,
    fulfilled,
  };
}
