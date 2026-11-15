import type { HelpingCenter } from './types';

/**
 * Synthetic Addis Ababa helping-center directory for demonstration only.
 * Never lists real organizations, phone numbers, or street addresses.
 */
export const SYNTHETIC_HELPING_CENTERS: HelpingCenter[] = [
  {
    id: 'demo-center-hope',
    name: 'Demo Hope One-Stop Center (Synthetic)',
    synthetic: true,
    subCity: 'Bole',
    serviceAreas: ['Bole', 'Yeka', 'Lemi Kura', 'City-wide'],
    categories: [
      'medical_support',
      'sexual_violence_support',
      'psychological_support',
      'protection_safeguarding',
    ],
    hours24x7: true,
    hoursLabel: '24/7 Demo Intake',
    childSafeguardingCapable: true,
    languages: ['Amharic', 'English', 'Afaan Oromo'],
    syntheticPhone: '+251-11-000-0101 (Synthetic Demo)',
    syntheticAddress: 'Demo Medical Wing, Bole Sub-City (Synthetic)',
    description:
      'Simulated hospital-linked one-stop care unit offering confidential medical exams, PEP window triage, crisis counseling, and safe coordination.',
  },
  {
    id: 'demo-center-amani',
    name: 'Demo Amani Safe Shelter & Safeguarding Hub (Synthetic)',
    synthetic: true,
    subCity: 'Kolfe Keranio',
    serviceAreas: ['Kolfe Keranio', 'Lideta', 'Gullele', 'City-wide'],
    categories: [
      'protection_safeguarding',
      'social_support',
      'psychological_support',
    ],
    hours24x7: true,
    hoursLabel: '24/7 Emergency Shelter Desk (Demo)',
    childSafeguardingCapable: true,
    languages: ['Amharic', 'English'],
    syntheticPhone: '+251-11-000-0102 (Synthetic Demo)',
    syntheticAddress: 'Confidential Demo Location, Kolfe Keranio (Synthetic)',
    description:
      'Simulated temporary safe housing, emergency essentials, child-friendly safeguarding coordination, and social reintegration support.',
  },
  {
    id: 'demo-center-addis-legal',
    name: 'Demo Addis Women Legal Aid Desk (Synthetic)',
    synthetic: true,
    subCity: 'Kirkos',
    serviceAreas: ['Kirkos', 'Arada', 'Bole', 'City-wide'],
    categories: ['legal_support', 'protection_safeguarding', 'social_support'],
    hours24x7: false,
    hoursLabel: 'Mon–Sat 08:30–17:30 (Demo)',
    childSafeguardingCapable: true,
    languages: ['Amharic', 'English', 'Tigrigna'],
    syntheticPhone: '+251-11-000-0103 (Synthetic Demo)',
    syntheticAddress: 'Demo Civic Annex, Kirkos Sub-City (Synthetic)',
    description:
      'Simulated legal clinic providing confidential guidance on protection orders, workplace harassment documentation, custody, and tenant rights.',
  },
  {
    id: 'demo-center-selam',
    name: 'Demo Selam Trauma & Counseling Center (Synthetic)',
    synthetic: true,
    subCity: 'Arada',
    serviceAreas: ['Arada', 'Gullele', 'Yeka', 'City-wide'],
    categories: ['psychological_support', 'sexual_violence_support', 'social_support'],
    hours24x7: false,
    hoursLabel: 'Daily 08:00–20:00 (Demo)',
    childSafeguardingCapable: false,
    languages: ['Amharic', 'English'],
    syntheticPhone: '+251-11-000-0104 (Synthetic Demo)',
    syntheticAddress: 'Demo Community House, Arada Sub-City (Synthetic)',
    description:
      'Simulated trauma-informed individual counseling, peer support circles, and non-judgmental emotional stabilization.',
  },
  {
    id: 'demo-center-nifas-clinic',
    name: 'Demo Nifas Silk Community Health & Support Wing (Synthetic)',
    synthetic: true,
    subCity: 'Nifas Silk-Lafto',
    serviceAreas: ['Nifas Silk-Lafto', 'Akaky Kaliti', 'Lideta'],
    categories: [
      'medical_support',
      'sexual_violence_support',
      'legal_support',
    ],
    hours24x7: true,
    hoursLabel: '24/7 Urgent Care Desk (Demo)',
    childSafeguardingCapable: true,
    languages: ['Amharic', 'Afaan Oromo', 'English'],
    syntheticPhone: '+251-11-000-0105 (Synthetic Demo)',
    syntheticAddress: 'Demo District Health Post, Nifas Silk-Lafto (Synthetic)',
    description:
      'Simulated local urgent medical care, optional injury documentation, and warm referrals to partner social workers.',
  },
  {
    id: 'demo-center-lideta-youth',
    name: 'Demo Lideta Family & Youth Social Center (Synthetic)',
    synthetic: true,
    subCity: 'Lideta',
    serviceAreas: ['Lideta', 'Kirkos', 'Akaky Kaliti', 'City-wide'],
    categories: ['social_support', 'protection_safeguarding', 'legal_support', 'psychological_support'],
    hours24x7: false,
    hoursLabel: 'Mon–Fri 08:30–18:00 (Demo)',
    childSafeguardingCapable: true,
    languages: ['Amharic', 'English'],
    syntheticPhone: '+251-11-000-0106 (Synthetic Demo)',
    syntheticAddress: 'Demo Youth & Family Wing, Lideta Sub-City (Synthetic)',
    description:
      'Simulated support for emergency transport/food stipends, vocational linkages, and minor safeguarding referrals.',
  },
];
