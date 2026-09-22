import type {
  BloodInventoryRow,
  BloodAvailability,
  AIAlert,
  ActivityItem,
  DemandDataPoint,
  BloodGroup,
  BloodComponent,
  CentreId,
  FacilityDistance,
} from '@/types';

export const CENTRES: { id: CentreId; name: string }[] = [
  { id: 'A', name: 'Centre A — City General' },
  { id: 'B', name: 'Centre B — Riverside' },
  { id: 'C', name: 'Centre C — Memorial' },
  { id: 'D', name: 'Centre D — St. Mary' },
];

export const BLOOD_GROUPS: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
export const COMPONENTS: BloodComponent[] = ['Packed RBC', 'Platelets', 'Fresh Frozen Plasma'];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const inventoryData: BloodInventoryRow[] = [
  { id: '1', centre: 'Centre A', centreId: 'A', bloodGroup: 'O+', component: 'Packed RBC', currentStock: 30, dailyConsumption: 8, expiryDate: daysFromNow(28), status: 'Adequate' },
  { id: '2', centre: 'Centre A', centreId: 'A', bloodGroup: 'O-', component: 'Packed RBC', currentStock: 6, dailyConsumption: 3, expiryDate: daysFromNow(20), status: 'Critical' },
  { id: '3', centre: 'Centre A', centreId: 'A', bloodGroup: 'A+', component: 'Platelets', currentStock: 18, dailyConsumption: 5, expiryDate: daysFromNow(3), status: 'Near Expiry' },
  { id: '4', centre: 'Centre B', centreId: 'B', bloodGroup: 'O+', component: 'Platelets', currentStock: 14, dailyConsumption: 6, expiryDate: daysFromNow(4), status: 'Near Expiry' },
  { id: '5', centre: 'Centre B', centreId: 'B', bloodGroup: 'B+', component: 'Packed RBC', currentStock: 22, dailyConsumption: 4, expiryDate: daysFromNow(25), status: 'Adequate' },
  { id: '6', centre: 'Centre B', centreId: 'B', bloodGroup: 'A-', component: 'Fresh Frozen Plasma', currentStock: 9, dailyConsumption: 2, expiryDate: daysFromNow(40), status: 'Low' },
  { id: '7', centre: 'Centre C', centreId: 'C', bloodGroup: 'AB+', component: 'Packed RBC', currentStock: 11, dailyConsumption: 2, expiryDate: daysFromNow(30), status: 'Adequate' },
  { id: '8', centre: 'Centre C', centreId: 'C', bloodGroup: 'O+', component: 'Fresh Frozen Plasma', currentStock: 7, dailyConsumption: 4, expiryDate: daysFromNow(35), status: 'Low' },
  { id: '9', centre: 'Centre C', centreId: 'C', bloodGroup: 'B-', component: 'Platelets', currentStock: 3, dailyConsumption: 2, expiryDate: daysFromNow(5), status: 'Critical' },
  { id: '10', centre: 'Centre D', centreId: 'D', bloodGroup: 'A+', component: 'Packed RBC', currentStock: 30, dailyConsumption: 6, expiryDate: daysFromNow(22), status: 'Adequate' },
  { id: '11', centre: 'Centre D', centreId: 'D', bloodGroup: 'O-', component: 'Platelets', currentStock: 5, dailyConsumption: 3, expiryDate: daysFromNow(2), status: 'Near Expiry' },
  { id: '12', centre: 'Centre D', centreId: 'D', bloodGroup: 'AB-', component: 'Fresh Frozen Plasma', currentStock: 8, dailyConsumption: 1, expiryDate: daysFromNow(38), status: 'Adequate' },
  { id: '13', centre: 'Centre A', centreId: 'A', bloodGroup: 'B+', component: 'Platelets', currentStock: 16, dailyConsumption: 4, expiryDate: daysFromNow(6), status: 'Near Expiry' },
  { id: '14', centre: 'Centre B', centreId: 'B', bloodGroup: 'A+', component: 'Packed RBC', currentStock: 12, dailyConsumption: 7, expiryDate: daysFromNow(18), status: 'Low' },
  { id: '15', centre: 'Centre C', centreId: 'C', bloodGroup: 'O+', component: 'Packed RBC', currentStock: 60, dailyConsumption: 9, expiryDate: daysFromNow(26), status: 'Adequate' },
  { id: '16', centre: 'Centre D', centreId: 'D', bloodGroup: 'A-', component: 'Packed RBC', currentStock: 4, dailyConsumption: 2, expiryDate: daysFromNow(15), status: 'Critical' },
  { id: '17', centre: 'Centre A', centreId: 'A', bloodGroup: 'AB+', component: 'Fresh Frozen Plasma', currentStock: 20, dailyConsumption: 3, expiryDate: daysFromNow(42), status: 'Adequate' },
  { id: '18', centre: 'Centre B', centreId: 'B', bloodGroup: 'O-', component: 'Fresh Frozen Plasma', currentStock: 10, dailyConsumption: 2, expiryDate: daysFromNow(33), status: 'Low' },
];

export const bloodAvailability: BloodAvailability[] = [
  { bloodGroup: 'O+', currentStock: 104, capacity: 150, status: 'Adequate' },
  { bloodGroup: 'O-', currentStock: 21, capacity: 80, status: 'Critical' },
  { bloodGroup: 'A+', currentStock: 60, capacity: 120, status: 'Adequate' },
  { bloodGroup: 'A-', currentStock: 23, capacity: 80, status: 'Low' },
  { bloodGroup: 'B+', currentStock: 38, capacity: 100, status: 'Low' },
  { bloodGroup: 'B-', currentStock: 9, capacity: 60, status: 'Critical' },
  { bloodGroup: 'AB+', currentStock: 31, capacity: 50, status: 'Adequate' },
  { bloodGroup: 'AB-', currentStock: 12, capacity: 40, status: 'Near Expiry' },
];

export const aiAlerts: AIAlert[] = [
  {
    id: 'a1',
    severity: 'critical',
    title: 'High shortage risk predicted for O+ Packed RBC at Centre A',
    bloodGroup: 'O+',
    component: 'Packed RBC',
    centre: 'Centre A',
    description: 'AI model projects stock will fall below safe threshold within 48 hours based on current consumption trends.',
    timestamp: '12 min ago',
  },
  {
    id: 'a2',
    severity: 'warning',
    title: '14 platelet units approaching expiry at Centre B',
    bloodGroup: 'O+',
    component: 'Platelets',
    centre: 'Centre B',
    description: 'Platelets expire within 5 days. Redistribution recommended to high-demand centres before wastage occurs.',
    timestamp: '34 min ago',
  },
  {
    id: 'a3',
    severity: 'info',
    title: 'A+ demand expected to increase tomorrow',
    bloodGroup: 'A+',
    component: 'Packed RBC',
    centre: 'Centre D',
    description: 'Seasonal demand pattern and scheduled surgeries indicate a 22% increase in A+ demand over the next 24 hours.',
    timestamp: '1 hr ago',
  },
  {
    id: 'a4',
    severity: 'warning',
    title: 'B- stock critically low across all centres',
    bloodGroup: 'B-',
    component: 'Platelets',
    centre: 'Centre C',
    description: 'Only 3 units of B- Platelets remain system-wide. Emergency donor outreach recommended.',
    timestamp: '2 hr ago',
  },
];

export const demandTrend: DemandDataPoint[] = [
  { day: 'Mon', O_pos: 32, A_pos: 24, B_pos: 12, AB_pos: 5, O_neg: 8 },
  { day: 'Tue', O_pos: 38, A_pos: 28, B_pos: 14, AB_pos: 6, O_neg: 10 },
  { day: 'Wed', O_pos: 30, A_pos: 22, B_pos: 10, AB_pos: 4, O_neg: 7 },
  { day: 'Thu', O_pos: 45, A_pos: 31, B_pos: 16, AB_pos: 7, O_neg: 12 },
  { day: 'Fri', O_pos: 52, A_pos: 36, B_pos: 18, AB_pos: 8, O_neg: 14 },
  { day: 'Sat', O_pos: 28, A_pos: 20, B_pos: 9, AB_pos: 3, O_neg: 6 },
  { day: 'Sun', O_pos: 24, A_pos: 18, B_pos: 8, AB_pos: 3, O_neg: 5 },
];

export const recentActivity: ActivityItem[] = [
  { id: '1', type: 'inventory', message: 'Inventory updated for Centre A — O+ Packed RBC', timestamp: '5 min ago' },
  { id: '2', type: 'prediction', message: 'Prediction generated: 48-hour shortage forecast for O-', timestamp: '18 min ago' },
  { id: '3', type: 'redistribution', message: 'Redistribution recommended: 8 units O+ from Centre C to Centre A', timestamp: '42 min ago' },
  { id: '4', type: 'emergency', message: 'Emergency request created: 6 units AB- for Memorial ER', timestamp: '1 hr ago' },
  { id: '5', type: 'inventory', message: 'Inventory updated for Centre B — A+ Platelets', timestamp: '2 hr ago' },
  { id: '6', type: 'prediction', message: 'Prediction generated: Near-expiry alert for 14 platelet units', timestamp: '3 hr ago' },
];

export const kpiData = {
  totalUnits: 298,
  criticalStock: 18,
  nearExpiryUnits: 47,
  predictedShortages: 3,
};

export const facilityDistances: FacilityDistance[] = [
  { from: 'A', to: 'B', distanceKm: 30, transportMinutes: 45 },
  { from: 'A', to: 'C', distanceKm: 55, transportMinutes: 75 },
  { from: 'A', to: 'D', distanceKm: 70, transportMinutes: 90 },
  { from: 'B', to: 'C', distanceKm: 40, transportMinutes: 55 },
  { from: 'B', to: 'D', distanceKm: 65, transportMinutes: 80 },
  { from: 'C', to: 'D', distanceKm: 35, transportMinutes: 50 },
  { from: 'B', to: 'A', distanceKm: 30, transportMinutes: 45 },
  { from: 'C', to: 'A', distanceKm: 55, transportMinutes: 75 },
  { from: 'D', to: 'A', distanceKm: 70, transportMinutes: 90 },
  { from: 'C', to: 'B', distanceKm: 40, transportMinutes: 55 },
  { from: 'D', to: 'B', distanceKm: 65, transportMinutes: 80 },
  { from: 'D', to: 'C', distanceKm: 35, transportMinutes: 50 },
];

export function getDistance(from: CentreId, to: CentreId): FacilityDistance | undefined {
  return facilityDistances.find((d) => d.from === from && d.to === to);
}
