import { UserProfile, GeneratedAction, EisenhowerQuadrant, ScoreBreakdown, InstagramResource, InstagramCategory } from '@/types/profile';
import { instagramResources } from '@/data/instagramResources';
import { es } from '@/i18n/es';
import { pt } from '@/i18n/pt';
import { Lang } from '@/lib/i18n';

function getT(lang: Lang = 'es') {
  const dict = lang === 'pt' ? pt : es;
  const fallback = es;
  return (key: string) => dict[key] ?? fallback[key] ?? key;
}

function makeBreakdown(factors: { factor: string; weight: number; value: number }[]): { score: number; breakdown: ScoreBreakdown[] } {
  const breakdown = factors.map(f => ({ ...f, contribution: f.weight * f.value }));
  const score = Math.min(100, Math.max(0, breakdown.reduce((s, b) => s + b.contribution, 0)));
  return { score, breakdown };
}

/**
 * Each profile input maps to exactly 0 or 1 recommendation.
 * A recommendation is SHOWN by default (when input is null/unanswered).
 * It is only SKIPPED when the user's answer indicates no action is needed.
 * With zero inputs → 19 recommendations.
 */
export function generatePlan(p: UserProfile, lang: Lang = 'es'): GeneratedAction[] {
  const t = getT(lang);
  const actions: GeneratedAction[] = [];
  let id = 0;
  const add = (a: Omit<GeneratedAction, 'id'>) => { actions.push({ ...a, id: `action-${id++}` }); };

  // ─── 1. age → Apply before 30 ───
  // Skip only if age is provided AND ≤ 29
  const skipAge = p.age !== null && p.age <= 29;
  if (!skipAge) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.age.f1'), weight: 8, value: 5 },
      { factor: t('action.age.f2'), weight: 7, value: 4 },
    ]);
    add({ title: t('action.age.title'), category: 'pr-booster', reason: t('action.age.reason'), checklist: [t('action.age.check1'), t('action.age.check2'), t('action.age.check3')], estimatedTime: t('action.age.time'), links: [{ label: 'CRS Calculator', url: 'https://www.cic.gc.ca/english/immigrate/skilled/crs-tool.asp' }], priorityScore: score, quadrant: (p.age !== null && p.age >= 40) ? 'urgent-important' : 'important-not-urgent', triggers: [t('action.age.trigger1')], scoreBreakdown: breakdown });
  }

  // ─── 2. canadianEdu → Pursue Canadian education ───
  // Skip if has college or higher in Canada
  const skipCanEdu = p.canadianEducation !== null && !['none', 'high-school'].includes(p.canadianEducation);
  if (!skipCanEdu) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.canadianEdu.f1'), weight: 6, value: 4 },
      { factor: t('action.canadianEdu.f2'), weight: 4, value: 3 },
      { factor: t('action.canadianEdu.f3'), weight: 3, value: 3 },
    ]);
    add({ title: t('action.canadianEdu.title'), category: 'pr-booster', reason: t('action.canadianEdu.reason'), checklist: [t('action.canadianEdu.check1'), t('action.canadianEdu.check2'), t('action.canadianEdu.check3'), t('action.canadianEdu.check4')], estimatedTime: t('action.canadianEdu.time'), links: [{ label: 'EduCanada', url: 'https://www.educanada.ca' }], priorityScore: score, quadrant: 'not-urgent-not-important', triggers: [t('action.canadianEdu.trigger1')], scoreBreakdown: breakdown });
  }

  // ─── 3. foreignEdu → WES evaluation ───
  // Skip if foreignEducation is 'none', or WES is completed/not-needed
  const skipWes = (p.foreignEducation === 'none') || (p.wesStatus === 'completed' || p.wesStatus === 'not-needed');
  if (!skipWes) {
    if (p.wesStatus === 'in-progress') {
      const { score, breakdown } = makeBreakdown([
        { factor: t('action.wesFollow.f1'), weight: 5, value: 4 },
        { factor: t('action.wesFollow.f2'), weight: 3, value: 3 },
      ]);
      add({ title: t('action.wesFollow.title'), category: 'pr-booster', reason: t('action.wesFollow.reason'), checklist: [t('action.wesFollow.check1'), t('action.wesFollow.check2'), t('action.wesFollow.check3')], estimatedTime: t('action.wesFollow.time'), links: [{ label: 'WES Status', url: 'https://www.wes.org/ca/' }], priorityScore: score, quadrant: 'urgent-not-important', triggers: [t('action.wesFollow.trigger1'), t('action.wesFollow.trigger2')], scoreBreakdown: breakdown });
    } else {
      const { score, breakdown } = makeBreakdown([
        { factor: t('action.wesStart.f1'), weight: 7, value: 5 },
        { factor: t('action.wesStart.f2'), weight: 5, value: 3 },
        { factor: t('action.wesStart.f3'), weight: 3, value: 2 },
      ]);
      add({ title: t('action.wesStart.title'), category: 'pr-booster', reason: t('action.wesStart.reason'), checklist: [t('action.wesStart.check1'), t('action.wesStart.check2'), t('action.wesStart.check3'), t('action.wesStart.check4')], estimatedTime: t('action.wesStart.time'), links: [{ label: 'WES Canada', url: 'https://www.wes.org/ca/' }], priorityScore: score, quadrant: 'important-not-urgent', triggers: [p.foreignEducation ? `${t('action.wesStart.triggerEdu')}: ${p.foreignEducation}` : t('action.wesStart.trigger2'), t('action.wesStart.trigger2')], scoreBreakdown: breakdown });
    }
  }

  // ─── 4. englishExam → Improve English ───
  // Skip only if scores are provided AND all high
  const hasGoodEnglish = (() => {
    if (!p.englishTestType) return false;
    const r = parseFloat(p.englishReading), l = parseFloat(p.englishListening), s = parseFloat(p.englishSpeaking), w = parseFloat(p.englishWriting);
    if (isNaN(r) || isNaN(l) || isNaN(s) || isNaN(w)) return false;
    if (p.englishTestType === 'celpip') return r >= 10 && l >= 10 && s >= 10 && w >= 10;
    if (p.englishTestType === 'ielts') return r >= 7 && l >= 7 && s >= 7 && w >= 7;
    return false;
  })();
  if (!hasGoodEnglish) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.english.f1'), weight: 8, value: 5 },
      { factor: t('action.english.f2'), weight: 6, value: 3 },
      { factor: t('action.english.f3'), weight: 3, value: 3 },
    ]);
    add({ title: t('action.english.title'), category: 'pr-booster', reason: t('action.english.reason'), checklist: [t('action.english.check1'), t('action.english.check2'), t('action.english.check3'), t('action.english.check4')], estimatedTime: t('action.english.time'), links: [{ label: 'LINC Classes', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/improve-english-french/classes.html' }], priorityScore: score, quadrant: 'urgent-important', triggers: [p.englishTestType ? `${t('action.english.triggerScore')}: ${p.englishReading}/${p.englishListening}/${p.englishSpeaking}/${p.englishWriting}` : t('action.english.triggerNoScore'), t('action.english.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 5. frenchExam → Learn/Improve French ───
  const hasGoodFrench = (() => {
    if (!p.frenchExamType) return false;
    const r = parseFloat(p.frenchReading), l = parseFloat(p.frenchListening), s = parseFloat(p.frenchSpeaking), w = parseFloat(p.frenchWriting);
    if (isNaN(r) || isNaN(l) || isNaN(s) || isNaN(w)) return false;
    if (p.frenchExamType === 'tef') return r >= 263 && l >= 310 && s >= 310 && w >= 263;
    if (p.frenchExamType === 'tcf') return r >= 453 && l >= 458 && s >= 10 && w >= 10;
    return false;
  })();
  if (!hasGoodFrench) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.french.f1'), weight: 7, value: 5 },
      { factor: t('action.french.f2'), weight: 5, value: 3 },
      { factor: t('action.french.f3'), weight: 3, value: 2 },
    ]);
    add({ title: t('action.french.title'), category: 'pr-booster', reason: t('action.french.reason'), checklist: [t('action.french.check1'), t('action.french.check2'), t('action.french.check3'), t('action.french.check4')], estimatedTime: t('action.french.time'), links: [{ label: 'Alliance Française', url: 'https://www.af.ca' }], priorityScore: score, quadrant: 'not-urgent-not-important', triggers: [p.frenchExamType ? t('action.french.triggerLow') : t('action.french.triggerNoScore')], scoreBreakdown: breakdown });
  }

  // ─── 6. workCanada → Accumulate Canadian work experience ───
  // Skip if ≥ 12 months
  const skipWorkCan = p.canadianWorkMonths >= 12;
  if (!skipWorkCan) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.workExp.f1'), weight: 7, value: 5 },
      { factor: t('action.workExp.f2'), weight: 5, value: 3 },
      { factor: t('action.workExp.f3'), weight: 3, value: 2 },
    ]);
    add({ title: t('action.workExp.title'), category: 'pr-booster', reason: t('action.workExp.reason'), checklist: [t('action.workExp.check1'), t('action.workExp.check2'), t('action.workExp.check3'), t('action.workExp.check4'), t('action.workExp.check5')], estimatedTime: t('action.workExp.time'), links: [{ label: 'Job Bank', url: 'https://www.jobbank.gc.ca' }], priorityScore: score, quadrant: 'urgent-important', triggers: [`${p.canadianWorkMonths} ${t('action.workExp.triggerMonths')}`, t('action.workExp.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 7. workForeign → Validate foreign work experience / TEER ───
  // Skip if foreignTeer is known AND foreignWorkMonths ≥ 36
  const skipForeignWork = p.foreignTeer !== 'unknown' && p.foreignWorkMonths >= 36;
  if (!skipForeignWork) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.foreignWork.f1'), weight: 6, value: 5 },
      { factor: t('action.foreignWork.f2'), weight: 4, value: 3 },
    ]);
    add({ title: t('action.foreignWork.title'), category: 'pr-booster', reason: t('action.foreignWork.reason'), checklist: [t('action.foreignWork.check1'), t('action.foreignWork.check2'), t('action.foreignWork.check3'), t('action.foreignWork.check4')], estimatedTime: t('action.foreignWork.time'), links: [{ label: 'NOC Finder', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/find-national-occupation-code.html' }], priorityScore: score, quadrant: 'urgent-not-important', triggers: [t('action.foreignWork.trigger1'), t('action.foreignWork.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 8. marital → Optimize family profile ───
  // Skip if single (no spousal strategy needed)
  const skipMarital = p.maritalStatus === 'single';
  if (!skipMarital) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.marital.f1'), weight: 5, value: 4 },
      { factor: t('action.marital.f2'), weight: 3, value: 3 },
    ]);
    add({ title: t('action.marital.title'), category: 'pr-booster', reason: t('action.marital.reason'), checklist: [t('action.marital.check1'), t('action.marital.check2'), t('action.marital.check3'), t('action.marital.check4')], estimatedTime: t('action.marital.time'), links: [{ label: 'CRS Calculator', url: 'https://www.cic.gc.ca/english/immigrate/skilled/crs-tool.asp' }], priorityScore: score, quadrant: 'not-urgent-not-important', triggers: [t('action.marital.trigger1')], scoreBreakdown: breakdown });
  }

  // ─── 9. working → Networking ───
  // Skip if working or studying
  const skipWorking = p.workingStatus === 'working' || p.workingStatus === 'studying';
  if (!skipWorking) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.networking.f1'), weight: 6, value: 5 },
      { factor: t('action.networking.f2'), weight: 4, value: 3 },
      { factor: t('action.networking.f3'), weight: 2, value: 2 },
    ]);
    add({ title: t('action.networking.title'), category: 'networking', reason: t('action.networking.reason'), checklist: [t('action.networking.check1'), t('action.networking.check2'), t('action.networking.check3'), t('action.networking.check4')], estimatedTime: t('action.networking.time'), links: [{ label: 'Meetup', url: 'https://www.meetup.com' }], priorityScore: score, quadrant: 'urgent-not-important', triggers: [p.workingStatus ? `${t('action.networking.triggerStatus')}: ${p.workingStatus === 'not-working' ? t('action.networking.triggerNotWorking') : t('action.networking.triggerLooking')}` : t('action.networking.trigger2'), t('action.networking.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 10. phone → Get Canadian phone ───
  // Skip only if hasPhone === true
  const skipPhone = p.hasPhone === true;
  if (!skipPhone) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.phone.f1'), weight: 8, value: 5 },
      { factor: t('action.phone.f2'), weight: 6, value: 3 },
      { factor: t('action.phone.f3'), weight: 4, value: 2 },
    ]);
    add({ title: t('action.phone.title'), category: 'telefono', reason: t('action.phone.reason'), checklist: [t('action.phone.check1'), t('action.phone.check2'), t('action.phone.check3')], estimatedTime: t('action.phone.time'), links: [{ label: 'Public Mobile', url: 'https://www.publicmobile.ca' }], priorityScore: score, quadrant: 'urgent-important', triggers: [t('action.phone.trigger1'), t('action.phone.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 11. banking → Open bank account ───
  // Skip only if hasBanking === true
  const skipBanking = p.hasBanking === true;
  if (!skipBanking) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.banking.f1'), weight: 10, value: 5 },
      { factor: t('action.banking.f2'), weight: 7, value: 3 },
      { factor: t('action.banking.f3'), weight: 3, value: 2 },
    ]);
    add({ title: t('action.banking.title'), category: 'banco', reason: t('action.banking.reason'), checklist: [t('action.banking.check1'), t('action.banking.check2'), t('action.banking.check3'), t('action.banking.check4')], estimatedTime: t('action.banking.time'), links: [{ label: 'Simplii Financial', url: 'https://www.simplii.com' }], priorityScore: score, quadrant: 'urgent-important', triggers: [t('action.banking.trigger1'), t('action.banking.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 12. health → Get health coverage ───
  // Skip if has any coverage (provincial, private, school, work)
  const skipHealth = p.healthCoverage !== null && p.healthCoverage !== 'none';
  if (!skipHealth) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.health.f1'), weight: 10, value: 5 },
      { factor: t('action.health.f2'), weight: 8, value: 3 },
      { factor: t('action.health.f3'), weight: 5, value: 2 },
    ]);
    add({ title: t('action.health.title'), category: 'salud', reason: t('action.health.reason'), checklist: [t('action.health.check1'), t('action.health.check2'), t('action.health.check3')], estimatedTime: t('action.health.time'), links: [{ label: 'Blue Cross', url: 'https://www.bluecross.ca' }], priorityScore: score, quadrant: 'urgent-important', triggers: [t('action.health.trigger1'), t('action.health.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 13. credit → Build or improve credit ───
  // Skip only if creditStatus === 'ok'
  const skipCredit = p.creditStatus === 'ok';
  if (!skipCredit) {
    if (p.creditStatus === 'poor') {
      const { score, breakdown } = makeBreakdown([
        { factor: t('action.creditImprove.f1'), weight: 6, value: 4 },
        { factor: t('action.creditImprove.f2'), weight: 5, value: 3 },
        { factor: t('action.creditImprove.f3'), weight: 3, value: 2 },
      ]);
      add({ title: t('action.creditImprove.title'), category: 'credito', reason: t('action.creditImprove.reason'), checklist: [t('action.creditImprove.check1'), t('action.creditImprove.check2'), t('action.creditImprove.check3'), t('action.creditImprove.check4')], estimatedTime: t('action.creditImprove.time'), links: [{ label: 'Credit Karma', url: 'https://www.creditkarma.ca' }], priorityScore: score, quadrant: 'important-not-urgent', triggers: [t('action.creditImprove.trigger1'), t('action.creditImprove.trigger2')], scoreBreakdown: breakdown });
    } else {
      const { score, breakdown } = makeBreakdown([
        { factor: t('action.creditBuild.f1'), weight: 6, value: 5 },
        { factor: t('action.creditBuild.f2'), weight: 5, value: 3 },
        { factor: t('action.creditBuild.f3'), weight: 2, value: 2 },
      ]);
      add({ title: t('action.creditBuild.title'), category: 'credito', reason: t('action.creditBuild.reason'), checklist: [t('action.creditBuild.check1'), t('action.creditBuild.check2'), t('action.creditBuild.check3'), t('action.creditBuild.check4'), t('action.creditBuild.check5')], estimatedTime: t('action.creditBuild.time'), links: [{ label: 'Borrowell', url: 'https://www.borrowell.com' }], priorityScore: score, quadrant: 'important-not-urgent', triggers: [p.creditStatus ? `${t('action.creditBuild.triggerStatus')}: ${p.creditStatus === 'none' ? t('action.creditBuild.triggerNone') : t('action.creditBuild.triggerNew')}` : t('action.creditBuild.trigger2'), t('action.creditBuild.trigger2')], scoreBreakdown: breakdown });
    }
  }

  // ─── 14. housingType → Stabilize housing ───
  // Skip if rent or own
  const skipHousing = p.housingType === 'rent' || p.housingType === 'own';
  if (!skipHousing) {
    if (p.housingType !== null && (p.housingType === 'airbnb' || p.housingType === 'temporary') && p.childrenCount > 0) {
      const { score, breakdown } = makeBreakdown([
        { factor: t('action.housingUrgent.f1'), weight: 10, value: 5 },
        { factor: t('action.housingUrgent.f2'), weight: 8, value: 3 },
        { factor: t('action.housingUrgent.f3'), weight: 5, value: 2 },
      ]);
      add({ title: t('action.housingUrgent.title'), category: 'vivienda', reason: t('action.housingUrgent.reason'), checklist: [t('action.housingUrgent.check1'), t('action.housingUrgent.check2'), t('action.housingUrgent.check3'), t('action.housingUrgent.check4')], estimatedTime: t('action.housingUrgent.time'), links: [{ label: 'Rentals.ca', url: 'https://www.rentals.ca' }], priorityScore: score, quadrant: 'urgent-important', triggers: [t('action.housingUrgent.trigger1'), `${p.childrenCount} ${t('action.housingUrgent.triggerChildren')}`], scoreBreakdown: breakdown });
    } else {
      const { score, breakdown } = makeBreakdown([
        { factor: t('action.housingPlan.f1'), weight: 7, value: 5 },
        { factor: t('action.housingPlan.f2'), weight: 5, value: 3 },
        { factor: t('action.housingPlan.f3'), weight: 3, value: 2 },
      ]);
      add({ title: t('action.housingPlan.title'), category: 'vivienda', reason: t('action.housingPlan.reason'), checklist: [t('action.housingPlan.check1'), t('action.housingPlan.check2'), t('action.housingPlan.check3'), t('action.housingPlan.check4')], estimatedTime: t('action.housingPlan.time'), links: [{ label: 'Rentals.ca', url: 'https://www.rentals.ca' }], priorityScore: score, quadrant: 'important-not-urgent', triggers: [t('action.housingPlan.trigger1'), t('action.housingPlan.trigger2')], scoreBreakdown: breakdown });
    }
  }

  // ─── 15. lookingHousing → Active housing search guidance ───
  // Skip if explicitly not looking
  const skipLookingHousing = p.lookingForHousing === false;
  if (!skipLookingHousing) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.lookingHousing.f1'), weight: 7, value: 4 },
      { factor: t('action.lookingHousing.f2'), weight: 5, value: 3 },
    ]);
    add({ title: t('action.lookingHousing.title'), category: 'vivienda', reason: t('action.lookingHousing.reason'), checklist: [t('action.lookingHousing.check1'), t('action.lookingHousing.check2'), t('action.lookingHousing.check3'), t('action.lookingHousing.check4')], estimatedTime: t('action.lookingHousing.time'), links: [{ label: 'Rentals.ca', url: 'https://www.rentals.ca' }], priorityScore: score, quadrant: 'urgent-not-important', triggers: [t('action.lookingHousing.trigger1')], scoreBreakdown: breakdown });
  }

  // ─── 16. houseInsurance → Rent/home insurance ───
  // Skip if has insurance (true) or housing is temporary/airbnb (not relevant)
  const skipInsurance = p.hasRentInsurance === true || p.housingType === 'airbnb' || p.housingType === 'temporary';
  if (!skipInsurance) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.rentInsurance.f1'), weight: 4, value: 4 },
      { factor: t('action.rentInsurance.f2'), weight: 3, value: 3 },
    ]);
    add({ title: t('action.rentInsurance.title'), category: 'vivienda', reason: t('action.rentInsurance.reason'), checklist: [t('action.rentInsurance.check1'), t('action.rentInsurance.check2'), t('action.rentInsurance.check3')], estimatedTime: t('action.rentInsurance.time'), links: [], priorityScore: score, quadrant: 'not-urgent-not-important', triggers: [t('action.rentInsurance.trigger1'), t('action.rentInsurance.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 17. immigration → PR pathway planning ───
  // Skip only if already PR
  const skipImmigration = p.immigrationStatus === 'pr';
  if (!skipImmigration) {
    const urgency: EisenhowerQuadrant = (p.immigrationStatus === 'pgwp' || p.immigrationStatus === 'visitor') ? 'urgent-important' : 'important-not-urgent';
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.immigration.f1'), weight: 9, value: 5 },
      { factor: t('action.immigration.f2'), weight: 6, value: 4 },
      { factor: t('action.immigration.f3'), weight: 4, value: 3 },
    ]);
    add({ title: t('action.immigration.title'), category: 'documentos', reason: t('action.immigration.reason'), checklist: [t('action.immigration.check1'), t('action.immigration.check2'), t('action.immigration.check3'), t('action.immigration.check4')], estimatedTime: t('action.immigration.time'), links: [{ label: 'Express Entry', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html' }], priorityScore: score, quadrant: urgency, triggers: [t('action.immigration.trigger1')], scoreBreakdown: breakdown });
  }

  // ─── 18. provincialId → Get provincial ID ───
  // Skip only if has ID (true)
  const skipProvId = p.hasProvincialId === true;
  if (!skipProvId) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.provincialId.f1'), weight: 7, value: 5 },
      { factor: t('action.provincialId.f2'), weight: 5, value: 3 },
      { factor: t('action.provincialId.f3'), weight: 3, value: 2 },
    ]);
    add({ title: t('action.provincialId.title'), category: 'documentos', reason: t('action.provincialId.reason'), checklist: [t('action.provincialId.check1'), t('action.provincialId.check2'), t('action.provincialId.check3')], estimatedTime: t('action.provincialId.time'), links: [], priorityScore: score, quadrant: 'urgent-not-important', triggers: [t('action.provincialId.trigger1'), t('action.provincialId.trigger2')], scoreBreakdown: breakdown });
  }

  // ─── 19. sinNumber → Get SIN ───
  // Skip only if has SIN (true)
  const skipSin = p.hasSin === true;
  if (!skipSin) {
    const { score, breakdown } = makeBreakdown([
      { factor: t('action.sin.f1'), weight: 10, value: 5 },
      { factor: t('action.sin.f2'), weight: 8, value: 3 },
      { factor: t('action.sin.f3'), weight: 7, value: 3 },
    ]);
    add({ title: t('action.sin.title'), category: 'documentos', reason: t('action.sin.reason'), checklist: [t('action.sin.check1'), t('action.sin.check2'), t('action.sin.check3')], estimatedTime: t('action.sin.time'), links: [{ label: 'Service Canada', url: 'https://www.canada.ca/en/employment-social-development/services/sin.html' }], priorityScore: score, quadrant: 'urgent-important', triggers: [t('action.sin.trigger1'), t('action.sin.trigger2')], scoreBreakdown: breakdown });
  }

  return actions.sort((a, b) => b.priorityScore - a.priorityScore);
}

export const quadrantLabels: Record<EisenhowerQuadrant, { title: string; color: string }> = {
  'urgent-important': { title: '🔴 Urgente + Importante', color: 'destructive' },
  'important-not-urgent': { title: '🟡 Importante + No Urgente', color: 'accent' },
  'urgent-not-important': { title: '🟠 Urgente + No Importante', color: 'secondary' },
  'not-urgent-not-important': { title: '🟢 No Urgente + No Importante', color: 'muted' },
};

export interface TriggeredCategory {
  category: InstagramCategory;
  triggers: string[];
}

export function getTriggeredInstagramCategories(p: UserProfile, lang: Lang = 'es'): TriggeredCategory[] {
  const t = getT(lang);
  const result: TriggeredCategory[] = [];

  if (p.immigrationStatus && p.immigrationStatus !== 'pr') {
    result.push({ category: 'immigration', triggers: [t('ig.trigger.immigration')] });
  } else if (!p.immigrationStatus) {
    result.push({ category: 'immigration', triggers: [t('ig.trigger.noStatus')] });
  }

  const taxTriggers: string[] = [];
  if (p.needsTaxHelp === true) taxTriggers.push(t('ig.trigger.taxHelp'));
  if (p.unsureTaxSituation) taxTriggers.push(t('ig.trigger.taxUnsure'));
  if (taxTriggers.length > 0) result.push({ category: 'taxes', triggers: taxTriggers });

  if (p.workingStatus === 'not-working' || p.workingStatus === 'looking') {
    result.push({ category: 'networking', triggers: [`${t('action.networking.triggerStatus')}: ${p.workingStatus === 'not-working' ? t('action.networking.triggerNotWorking') : t('action.networking.triggerLooking')} — ${t('ig.trigger.networking')}`] });
  }

  return result;
}

export function getRankedInstagramAccounts(p: UserProfile, triggeredCategories: TriggeredCategory[]): InstagramResource[] {
  const catSet = new Set(triggeredCategories.map(c => c.category));
  const cityLower = p.city.toLowerCase();

  const filtered = instagramResources.filter(r => catSet.has(r.category));

  const scored = filtered.map(r => {
    let boost = 0;
    if (r.city === 'Toronto' && cityLower.includes('toronto')) boost = 30;
    if (r.city === 'Montreal' && (cityLower.includes('montreal') || cityLower.includes('montréal'))) boost = 30;
    return { ...r, effectiveScore: r.priorityBase + boost };
  });

  scored.sort((a, b) => b.effectiveScore - a.effectiveScore);

  const counts: Record<string, number> = {};
  return scored.filter(r => {
    counts[r.category] = (counts[r.category] || 0) + 1;
    return counts[r.category] <= 3;
  });
}

export function getStatusSnapshot(p: UserProfile, plan: GeneratedAction[], lang: Lang = 'es') {
  const t = getT(lang);
  type Status = 'red' | 'yellow' | 'green' | 'white';

  // Map status categories to action categories used in generatePlan
  const categoryMap: Record<string, string[]> = {
    documents: ['documentos'],
    housing: ['vivienda'],
    banking: ['banco', 'telefono'],
    health: ['salud'],
    credit: ['credito'],
    prBooster: ['pr-booster', 'networking'],
  };

  // Check if ANY related input has been touched
  const anyInputCompleted: Record<string, boolean> = {
    documents: p.immigrationStatus !== null || p.hasProvincialId !== null || p.hasSin !== null,
    housing: p.housingType !== null || p.lookingForHousing !== null || p.hasRentInsurance !== null,
    banking: p.hasBanking !== null || p.hasPhone !== null,
    health: p.healthCoverage !== null,
    credit: p.creditStatus !== null || p.knowsCreditScore !== null,
    prBooster: p.age !== null || p.canadianEducation !== null || p.foreignEducation !== null ||
      p.englishTestType !== '' || p.frenchExamType !== '' || p.canadianWorkMonths > 0 ||
      p.foreignWorkMonths > 0 || p.maritalStatus !== null || p.workingStatus !== null,
  };

  function deriveStatus(key: string): Status {
    if (!anyInputCompleted[key]) return 'white';
    const relatedActions = plan.filter(a => categoryMap[key].includes(a.category));
    if (relatedActions.length === 0) return 'green';
    const hasUrgentImportant = relatedActions.some(a => a.quadrant === 'urgent-important');
    if (hasUrgentImportant) return 'red';
    const hasMiddle = relatedActions.some(a => a.quadrant === 'important-not-urgent' || a.quadrant === 'urgent-not-important');
    if (hasMiddle) return 'yellow';
    return 'green';
  }

  return [
    { label: t('status.documents'), icon: '📄', status: deriveStatus('documents') },
    { label: t('status.housing'), icon: '🏠', status: deriveStatus('housing') },
    { label: t('status.banking'), icon: '🏦', status: deriveStatus('banking') },
    { label: t('status.health'), icon: '🏥', status: deriveStatus('health') },
    { label: t('status.credit'), icon: '💳', status: deriveStatus('credit') },
    { label: t('status.prBooster'), icon: '🚀', status: deriveStatus('prBooster') },
  ];
}
