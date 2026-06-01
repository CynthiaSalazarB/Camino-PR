export type MaritalStatus = 'single' | 'married' | 'common-law';
export type ImmigrationStatus = 'study-permit' | 'pgwp' | 'work-permit' | 'visitor' | 'pr' | 'other';
export type WorkingStatus = 'working' | 'not-working' | 'studying' | 'looking';
export type WesStatus = 'not-started' | 'in-progress' | 'completed' | 'not-needed';
export type HealthCoverage = 'provincial' | 'private' | 'school' | 'work' | 'none';
export type HousingType = 'airbnb' | 'temporary' | 'rent' | 'own';
export type CreditStatus = 'none' | 'new' | 'ok' | 'poor';
export type EducationLevel = 'none' | 'high-school' | 'college' | 'bachelor' | 'master' | 'phd';
export type TeerCategory = '0' | '1' | '2' | '3' | '4' | '5' | 'unknown';

export interface UserProfile {
  // A) Personal
  age: number | null;
  maritalStatus: MaritalStatus | null;
  partnerComing: boolean;
  childrenCount: number;
  immigrationStatus: ImmigrationStatus | null;
  province: string;
  city: string;
  workingStatus: WorkingStatus | null;
  // B) Education
  canadianEducation: EducationLevel | null;
  foreignEducation: EducationLevel | null;
  wesStatus: WesStatus | null;
  // C) Languages
  englishScore: string;
  englishTestType: string;
  englishReading: string;
  englishListening: string;
  englishSpeaking: string;
  englishWriting: string;
  frenchScore: string;
  frenchExamType: string;
  frenchReading: string;
  frenchListening: string;
  frenchSpeaking: string;
  frenchWriting: string;
  // D) Work Experience
  canadianWorkMonths: number;
  canadianJobTitle: string;
  canadianTeer: TeerCategory;
  foreignWorkMonths: number;
  foreignJobTitle: string;
  foreignTeer: TeerCategory;
  // E) Settlement
  hasSin: boolean | null;
  hasPhone: boolean | null;
  hasBanking: boolean | null;
  healthCoverage: HealthCoverage | null;
  hasProvincialId: boolean | null;
  provincialIdType: string | null;
  housingType: HousingType | null;
  housingBudget: string;
  housingShared: boolean;
  lookingForHousing: boolean | null;
  hasRentInsurance: boolean | null;
  creditStatus: CreditStatus | null;
  knowsCreditScore: boolean | null;
  // F) Tax
  needsTaxHelp: boolean | null;
  unsureTaxSituation: boolean;
}

export type InstagramCategory = 'immigration' | 'taxes' | 'networking';

export interface InstagramResource {
  id: string;
  category: InstagramCategory;
  platform: 'instagram';
  handle: string;
  url: string;
  scope: 'Canada-wide' | 'City';
  city?: string;
  tags?: string[];
  curated: true;
  priorityBase: number;
  disclaimer: string;
}

export type SectionId = 'personal' | 'education' | 'languages' | 'work' | 'settlement';

export type SectionStatus = 'empty' | 'in-progress' | 'complete';

export type CompletionStatus = Record<SectionId, SectionStatus>;

export type EisenhowerQuadrant = 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';

export interface ScoreBreakdown {
  factor: string;
  weight: number;
  value: number;
  contribution: number;
}

export interface GeneratedAction {
  id: string;
  title: string;
  category: string;
  reason: string;
  checklist: string[];
  estimatedTime: string;
  links: { label: string; url: string }[];
  priorityScore: number;
  quadrant: EisenhowerQuadrant;
  triggers: string[];
  scoreBreakdown: ScoreBreakdown[];
}

export interface AppState {
  userProfile: UserProfile;
  completionStatus: CompletionStatus;
  generatedPlan: GeneratedAction[];
  completedActions: string[];
  savedAt: string | null;
}

export const defaultProfile: UserProfile = {
  age: null, maritalStatus: null, partnerComing: false, childrenCount: 0,
  immigrationStatus: null, province: '', city: '', workingStatus: null,
  canadianEducation: null, foreignEducation: null, wesStatus: null,
  englishScore: '', englishTestType: '', englishReading: '', englishListening: '', englishSpeaking: '', englishWriting: '',
  frenchScore: '', frenchExamType: '', frenchReading: '', frenchListening: '', frenchSpeaking: '', frenchWriting: '',
  canadianWorkMonths: 0, canadianJobTitle: '', canadianTeer: 'unknown',
  foreignWorkMonths: 0, foreignJobTitle: '', foreignTeer: 'unknown',
  hasSin: null, hasPhone: null, hasBanking: null, healthCoverage: null,
  hasProvincialId: null, provincialIdType: null,
  housingType: null, housingBudget: '', housingShared: false, lookingForHousing: null,
  hasRentInsurance: null, creditStatus: null, knowsCreditScore: null,
  needsTaxHelp: null, unsureTaxSituation: false,
};

export const defaultCompletionStatus: CompletionStatus = {
  personal: 'empty', education: 'empty', languages: 'empty', work: 'empty', settlement: 'empty',
};
