import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { loadState, saveState, getDefaultState, hasSavedState } from '@/lib/storage';
import { generatePlan } from '@/lib/rulesEngine';
import { UserProfile, AppState, SectionId, SectionStatus } from '@/types/profile';
import { CheckCircle2, HelpCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { provinceList, provincesAndCities } from '@/data/provinces';
import BottomNav from '@/components/BottomNav';

/* ─── Section definitions aligned to SectionId ─── */
interface SectionDef {
  id: SectionId;
  titleKey: string;
  emoji: string;
  colorClass: string;
  nodes: string[];
}

const SECTIONS: SectionDef[] = [
  {
    id: 'personal',
    titleKey: 'section.personal',
    emoji: '👤',
    colorClass: 'bg-mindmap-personal',
    nodes: ['age', 'immigrationStatus', 'province', 'marital', 'working'],
  },
  {
    id: 'education',
    titleKey: 'section.education',
    emoji: '🎓',
    colorClass: 'bg-mindmap-docs',
    nodes: ['canadianEdu', 'foreignEdu', 'wesStatus'],
  },
  {
    id: 'languages',
    titleKey: 'section.languages',
    emoji: '🌍',
    colorClass: 'bg-mindmap-services',
    nodes: ['englishExam', 'frenchExam'],
  },
  {
    id: 'work',
    titleKey: 'section.work',
    emoji: '💼',
    colorClass: 'bg-mindmap-housing',
    nodes: ['workCanada', 'workForeign', 'foreignTeer'],
  },
  {
    id: 'settlement',
    titleKey: 'section.settlement',
    emoji: '🏠',
    colorClass: 'bg-secondary',
    nodes: ['sin', 'phone', 'banking', 'health', 'provincialId', 'housingType', 'lookingHousing', 'houseInsurance', 'creditStatus', 'needsTaxHelp'],
  },
];

/* ─── component ─── */
const ProfileBuilder = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [state, setState] = useState<AppState>(getDefaultState);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [quickStep, setQuickStep] = useState(0);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setState(prev => ({ ...prev, ...saved, completedActions: saved.completedActions ?? [] }));
    } else {
      setShowQuickStart(true);
    }
  }, []);

  const p = state.userProfile;

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState(prev => {
      const next = { ...prev, userProfile: { ...prev.userProfile, ...updates } };
      saveState(next);
      return next;
    });
  }, []);

  const isNodeComplete = useCallback((id: string): boolean => {
    switch (id) {
      case 'age': return p.age !== null;
      case 'immigrationStatus': return p.immigrationStatus !== null;
      case 'province': return p.province !== '';
      case 'marital': return p.maritalStatus !== null;
      case 'working': return p.workingStatus !== null;
      case 'canadianEdu': return p.canadianEducation !== null;
      case 'foreignEdu': return p.foreignEducation !== null;
      case 'wesStatus': return p.wesStatus !== null;
      case 'englishExam': return !!p.englishTestType;
      case 'frenchExam': return !!p.frenchExamType;
      case 'workCanada': return p.canadianWorkMonths > 0;
      case 'workForeign': return p.foreignWorkMonths > 0;
      case 'foreignTeer': return p.foreignTeer !== 'unknown';
      case 'sin': return p.hasSin !== null;
      case 'phone': return p.hasPhone !== null;
      case 'banking': return p.hasBanking !== null;
      case 'health': return p.healthCoverage !== null;
      case 'provincialId': return p.hasProvincialId !== null;
      case 'housingType': return p.housingType !== null;
      case 'lookingHousing': return p.lookingForHousing !== null;
      case 'houseInsurance': return p.hasRentInsurance !== null;
      case 'creditStatus': return p.creditStatus !== null;
      case 'needsTaxHelp': return p.needsTaxHelp !== null;
      default: return false;
    }
  }, [p]);

  const computeSectionStatus = useCallback((sec: SectionDef): SectionStatus => {
    const completed = sec.nodes.filter(id => isNodeComplete(id)).length;
    if (completed === 0) return 'empty';
    if (completed === sec.nodes.length) return 'complete';
    return 'in-progress';
  }, [isNodeComplete]);

  const handleSheetClose = useCallback((sectionId: SectionId) => {
    setState(prev => {
      const sec = SECTIONS.find(s => s.id === sectionId)!;
      const nodes = sec.nodes;
      const completed = nodes.filter(id => isNodeComplete(id)).length;
      const status: SectionStatus = completed === 0 ? 'empty' : completed === nodes.length ? 'complete' : 'in-progress';
      const updated = {
        ...prev,
        completionStatus: { ...prev.completionStatus, [sectionId]: status },
      };
      saveState(updated);
      return updated;
    });
    setActiveSection(null);
  }, [isNodeComplete]);

  const handleGeneratePlan = () => {
    const plan = generatePlan(state.userProfile, lang);
    const finalState = { ...state, generatedPlan: plan };
    saveState(finalState);
    setState(finalState);
    navigate('/results');
  };

  const handleQuickStartDone = () => {
    setShowQuickStart(false);
    saveState(state);
  };

  const cityOptions = p.province ? (provincesAndCities[p.province] ?? []) : [];

  /* ─── Section form content ─── */
  const renderSectionForm = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t('profile.age')}</Label>
              <Input type="number" placeholder={t('profile.age.placeholder')} value={p.age ?? ''}
                onChange={e => updateProfile({ age: e.target.value ? parseInt(e.target.value) : null })} />
            </div>

            <div className="space-y-2">
              <Label>{t('profile.immigrationStatus')}</Label>
              <Select value={p.immigrationStatus ?? ''} onValueChange={v => updateProfile({ immigrationStatus: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="study-permit">{t('profile.immigrationStatus.studyPermit')}</SelectItem>
                  <SelectItem value="pgwp">{t('profile.immigrationStatus.pgwp')}</SelectItem>
                  <SelectItem value="work-permit">{t('profile.immigrationStatus.workPermit')}</SelectItem>
                  <SelectItem value="visitor">{t('profile.immigrationStatus.visitor')}</SelectItem>
                  <SelectItem value="pr">{t('profile.immigrationStatus.pr')}</SelectItem>
                  <SelectItem value="other">{t('profile.immigrationStatus.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.province')}</Label>
              <Select value={p.province} onValueChange={v => updateProfile({ province: v, city: '' })}>
                <SelectTrigger><SelectValue placeholder={t('profile.province.placeholder')} /></SelectTrigger>
                <SelectContent>
                  {provinceList.map(prov => (
                    <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cityOptions.length > 0 && (
              <div className="space-y-2">
                <Label>{t('profile.city')}</Label>
                <Select value={p.city} onValueChange={v => updateProfile({ city: v })}>
                  <SelectTrigger><SelectValue placeholder={t('profile.city.placeholder')} /></SelectTrigger>
                  <SelectContent>
                    {cityOptions.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('profile.maritalStatus')}</Label>
              <Select value={p.maritalStatus ?? ''} onValueChange={v => updateProfile({ maritalStatus: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{t('profile.maritalStatus.single')}</SelectItem>
                  <SelectItem value="married">{t('profile.maritalStatus.married')}</SelectItem>
                  <SelectItem value="common-law">{t('profile.maritalStatus.commonLaw')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(p.maritalStatus === 'married' || p.maritalStatus === 'common-law') && (
              <div className="flex items-center gap-3">
                <Switch checked={p.partnerComing} onCheckedChange={v => updateProfile({ partnerComing: v })} />
                <Label>{t('profile.partnerComing')}</Label>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('profile.children')}</Label>
              <Input type="number" placeholder={t('profile.children.placeholder')} min={0} value={p.childrenCount || ''}
                onChange={e => updateProfile({ childrenCount: parseInt(e.target.value) || 0 })} />
            </div>

            <div className="space-y-2">
              <Label>{t('profile.workingStatus')}</Label>
              <Select value={p.workingStatus ?? ''} onValueChange={v => updateProfile({ workingStatus: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">{t('profile.workingStatus.working')}</SelectItem>
                  <SelectItem value="not-working">{t('profile.workingStatus.notWorking')}</SelectItem>
                  <SelectItem value="studying">{t('profile.workingStatus.studying')}</SelectItem>
                  <SelectItem value="looking">{t('profile.workingStatus.looking')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t('profile.canadianEducation')}</Label>
              <Select value={p.canadianEducation ?? ''} onValueChange={v => updateProfile({ canadianEducation: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('profile.edu.none')}</SelectItem>
                  <SelectItem value="high-school">{t('profile.edu.highSchool')}</SelectItem>
                  <SelectItem value="college">{t('profile.edu.college')}</SelectItem>
                  <SelectItem value="bachelor">{t('profile.edu.bachelor')}</SelectItem>
                  <SelectItem value="master">{t('profile.edu.master')}</SelectItem>
                  <SelectItem value="phd">{t('profile.edu.phd')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.foreignEducation')}</Label>
              <Select value={p.foreignEducation ?? ''} onValueChange={v => updateProfile({ foreignEducation: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('profile.edu.none')}</SelectItem>
                  <SelectItem value="high-school">{t('profile.edu.highSchool')}</SelectItem>
                  <SelectItem value="college">{t('profile.edu.collegeAlt')}</SelectItem>
                  <SelectItem value="bachelor">{t('profile.edu.bachelorAlt')}</SelectItem>
                  <SelectItem value="master">{t('profile.edu.master')}</SelectItem>
                  <SelectItem value="phd">{t('profile.edu.phd')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('profile.wes')}</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[250px]"><p className="text-xs">{t('profile.wes.tooltip')}</p></TooltipContent>
                </Tooltip>
              </div>
              <Select value={p.wesStatus ?? ''} onValueChange={v => updateProfile({ wesStatus: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">{t('profile.wes.notStarted')}</SelectItem>
                  <SelectItem value="in-progress">{t('profile.wes.inProgress')}</SelectItem>
                  <SelectItem value="completed">{t('profile.wes.completed')}</SelectItem>
                  <SelectItem value="not-needed">{t('profile.wes.notNeeded')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-6">
            <div className="space-y-3 p-3 rounded-lg border border-border/50 bg-muted/30">
              <Label className="font-semibold">{t('profile.englishExam')}</Label>
              <div className="space-y-2">
                <Label className="text-xs">{t('profile.examType')}</Label>
                <Select value={p.englishTestType} onValueChange={v => updateProfile({ englishTestType: v })}>
                  <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ielts">IELTS</SelectItem>
                    <SelectItem value="celpip">CELPIP</SelectItem>
                    <SelectItem value="estimate">{t('profile.englishTestType.estimate')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('profile.reading')}</Label>
                  <Input placeholder={t('profile.score.placeholder')} value={p.englishReading} onChange={e => updateProfile({ englishReading: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('profile.listening')}</Label>
                  <Input placeholder={t('profile.score.placeholder')} value={p.englishListening} onChange={e => updateProfile({ englishListening: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('profile.speaking')}</Label>
                  <Input placeholder={t('profile.score.placeholder')} value={p.englishSpeaking} onChange={e => updateProfile({ englishSpeaking: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('profile.writing')}</Label>
                  <Input placeholder={t('profile.score.placeholder')} value={p.englishWriting} onChange={e => updateProfile({ englishWriting: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-3 rounded-lg border border-border/50 bg-muted/30">
              <Label className="font-semibold">{t('profile.frenchExam')}</Label>
              <div className="space-y-2">
                <Label className="text-xs">{t('profile.examType')}</Label>
                <Select value={p.frenchExamType} onValueChange={v => updateProfile({ frenchExamType: v })}>
                  <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tef">TEF</SelectItem>
                    <SelectItem value="tcf">TCF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('profile.reading')}</Label>
                  <Input placeholder={t('profile.score.placeholder')} value={p.frenchReading} onChange={e => updateProfile({ frenchReading: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('profile.listening')}</Label>
                  <Input placeholder={t('profile.score.placeholder')} value={p.frenchListening} onChange={e => updateProfile({ frenchListening: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('profile.speaking')}</Label>
                  <Input placeholder={t('profile.score.placeholder')} value={p.frenchSpeaking} onChange={e => updateProfile({ frenchSpeaking: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('profile.writing')}</Label>
                  <Input placeholder={t('profile.score.placeholder')} value={p.frenchWriting} onChange={e => updateProfile({ frenchWriting: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'work':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('profile.workCanada')} — {t('profile.workYears')}</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[250px]"><p className="text-xs">{t('profile.workTeerTooltip')}</p></TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" placeholder={t('profile.workYears.placeholder')} min={0}
                value={p.canadianWorkMonths ? Math.round(p.canadianWorkMonths / 12) : ''}
                onChange={e => updateProfile({ canadianWorkMonths: (parseInt(e.target.value) || 0) * 12 })} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('profile.workForeign')} — {t('profile.workYears')}</Label>
              </div>
              <Input type="number" placeholder={t('profile.workYears.placeholder')} min={0}
                value={p.foreignWorkMonths ? Math.round(p.foreignWorkMonths / 12) : ''}
                onChange={e => updateProfile({ foreignWorkMonths: (parseInt(e.target.value) || 0) * 12 })} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('profile.foreignTeer')}</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[250px]"><p className="text-xs">{t('profile.workTeerTooltip')}</p></TooltipContent>
                </Tooltip>
              </div>
              <Select value={p.foreignTeer} onValueChange={v => updateProfile({ foreignTeer: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">{t('profile.teer.unknown')}</SelectItem>
                  <SelectItem value="0">{t('profile.teer.0')}</SelectItem>
                  <SelectItem value="1">{t('profile.teer.1')}</SelectItem>
                  <SelectItem value="2">{t('profile.teer.2')}</SelectItem>
                  <SelectItem value="3">{t('profile.teer.3')}</SelectItem>
                  <SelectItem value="4">{t('profile.teer.4')}</SelectItem>
                  <SelectItem value="5">{t('profile.teer.5')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'settlement':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t('profile.hasSin')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasSin === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasSin: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasSin === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasSin: false })}>{t('btn.no')}</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.hasPhone')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasPhone === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasPhone: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasPhone === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasPhone: false })}>{t('btn.no')}</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.hasBanking')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasBanking === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasBanking: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasBanking === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasBanking: false })}>{t('btn.no')}</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.healthCoverage')}</Label>
              <Select value={p.healthCoverage ?? ''} onValueChange={v => updateProfile({ healthCoverage: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="provincial">{t('profile.healthCoverage.provincial')}</SelectItem>
                  <SelectItem value="private">{t('profile.healthCoverage.private')}</SelectItem>
                  <SelectItem value="school">{t('profile.healthCoverage.school')}</SelectItem>
                  <SelectItem value="work">{t('profile.healthCoverage.work')}</SelectItem>
                  <SelectItem value="none">{t('profile.healthCoverage.none')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.hasProvincialId')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasProvincialId === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasProvincialId: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasProvincialId === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasProvincialId: false })}>{t('btn.no')}</Button>
              </div>
            </div>
            {p.hasProvincialId === true && (
              <div className="space-y-2">
                <Label>{t('profile.provincialIdType')}</Label>
                <Select value={p.provincialIdType ?? ''} onValueChange={v => updateProfile({ provincialIdType: v })}>
                  <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver-license">{t('profile.driverLicense')}</SelectItem>
                    <SelectItem value="photo-card">{t('profile.photoCard')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('profile.housingType')}</Label>
              <Select value={p.housingType ?? ''} onValueChange={v => updateProfile({ housingType: v as any })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="airbnb">{t('profile.housingType.airbnb')}</SelectItem>
                  <SelectItem value="temporary">{t('profile.housingType.temporary')}</SelectItem>
                  <SelectItem value="rent">{t('profile.housingType.rent')}</SelectItem>
                  <SelectItem value="own">{t('profile.housingType.own')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.lookingForHousing')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.lookingForHousing === true ? 'default' : 'outline'} onClick={() => updateProfile({ lookingForHousing: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.lookingForHousing === false ? 'default' : 'outline'} onClick={() => updateProfile({ lookingForHousing: false })}>{t('btn.no')}</Button>
              </div>
            </div>
            {p.lookingForHousing === true && (
              <>
                <div className="space-y-2">
                  <Label>{t('profile.housingBudget')}</Label>
                  <Input placeholder={t('profile.housingBudget.placeholder')} value={p.housingBudget} onChange={e => updateProfile({ housingBudget: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.housingPrivateOrShared')}</Label>
                  <div className="flex gap-2">
                    <Button className="flex-1" variant={p.housingShared === false ? 'default' : 'outline'} onClick={() => updateProfile({ housingShared: false })}>{t('profile.private')}</Button>
                    <Button className="flex-1" variant={p.housingShared === true ? 'default' : 'outline'} onClick={() => updateProfile({ housingShared: true })}>{t('profile.shared')}</Button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>{t('profile.hasRentInsurance')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasRentInsurance === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasRentInsurance: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasRentInsurance === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasRentInsurance: false })}>{t('btn.no')}</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.creditStatus')}</Label>
              <Select value={p.creditStatus ?? ''} onValueChange={v => updateProfile({ creditStatus: v as any, knowsCreditScore: v !== null })}>
                <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('profile.creditStatus.none')}</SelectItem>
                  <SelectItem value="new">{t('profile.creditStatus.new')}</SelectItem>
                  <SelectItem value="ok">{t('profile.creditStatus.ok')}</SelectItem>
                  <SelectItem value="poor">{t('profile.creditStatus.poor')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('profile.needsTaxHelp')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.needsTaxHelp === true ? 'default' : 'outline'} onClick={() => updateProfile({ needsTaxHelp: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.needsTaxHelp === false ? 'default' : 'outline'} onClick={() => updateProfile({ needsTaxHelp: false })}>{t('btn.no')}</Button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Switch checked={p.unsureTaxSituation} onCheckedChange={v => updateProfile({ unsureTaxSituation: v })} />
                <Label className="text-sm text-muted-foreground">{t('profile.unsureTaxSituation')}</Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const activeSectionDef = SECTIONS.find(s => s.id === activeSection);

  /* ─── Quick-start modal steps ─── */
  const quickSteps = [
    {
      question: t('quickstart.q1'),
      content: (
        <Select value={p.immigrationStatus ?? ''} onValueChange={v => updateProfile({ immigrationStatus: v as any })}>
          <SelectTrigger><SelectValue placeholder={t('select.placeholder')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="study-permit">{t('profile.immigrationStatus.studyPermit')}</SelectItem>
            <SelectItem value="pgwp">{t('profile.immigrationStatus.pgwp')}</SelectItem>
            <SelectItem value="work-permit">{t('profile.immigrationStatus.workPermit')}</SelectItem>
            <SelectItem value="visitor">{t('profile.immigrationStatus.visitor')}</SelectItem>
            <SelectItem value="pr">{t('profile.immigrationStatus.pr')}</SelectItem>
            <SelectItem value="other">{t('profile.immigrationStatus.other')}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      question: t('quickstart.q2'),
      content: (
        <Select value={p.province} onValueChange={v => updateProfile({ province: v, city: '' })}>
          <SelectTrigger><SelectValue placeholder={t('profile.province.placeholder')} /></SelectTrigger>
          <SelectContent>
            {provinceList.map(prov => (
              <SelectItem key={prov} value={prov}>{prov}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      question: t('quickstart.q3'),
      content: (
        <div className="flex flex-col gap-2">
          {(['working', 'not-working', 'studying', 'looking'] as const).map(ws => (
            <Button key={ws} variant={p.workingStatus === ws ? 'default' : 'outline'} className="justify-start"
              onClick={() => updateProfile({ workingStatus: ws })}>
              {t(`profile.workingStatus.${ws === 'not-working' ? 'notWorking' : ws === 'studying' ? 'studying' : ws === 'looking' ? 'looking' : 'working'}`)}
            </Button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="font-bold text-lg text-foreground">{t('profile.title')}</h2>
        <Button size="sm" onClick={handleGeneratePlan} className="text-xs gap-1">
          {t('btn.generatePlan')} <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Section card grid */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {SECTIONS.map(sec => {
            const status = computeSectionStatus(sec);
            const completedCount = sec.nodes.filter(id => isNodeComplete(id)).length;
            const isComplete = status === 'complete';
            return (
              <Card
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`cursor-pointer hover:shadow-md transition-all active:scale-95 border-2 ${
                  isComplete ? 'border-primary/50' : 'border-border'
                } ${sec.id === 'settlement' ? 'col-span-2' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-2xl">{sec.emoji}</span>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className={`font-semibold text-sm text-foreground ${sec.id === 'settlement' ? '' : 'truncate'}`}>
                    {t(sec.titleKey)}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(completedCount / sec.nodes.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {completedCount}/{sec.nodes.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section Sheet */}
      <Sheet open={!!activeSection} onOpenChange={open => {
        if (!open && activeSection) handleSheetClose(activeSection);
      }}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto sm:max-w-lg sm:mx-auto rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              {activeSectionDef && <span className="text-xl">{activeSectionDef.emoji}</span>}
              {activeSectionDef && t(activeSectionDef.titleKey)}
            </SheetTitle>
            <SheetDescription className="text-xs">{t('mindmap.clickToFill')}</SheetDescription>
          </SheetHeader>
          {activeSection && renderSectionForm(activeSection)}
          <div className="pt-6 pb-2">
            <Button className="w-full" onClick={() => activeSection && handleSheetClose(activeSection)}>
              {t('btn.done')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick-start Dialog */}
      <Dialog open={showQuickStart} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm mx-auto" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('quickstart.title')}</DialogTitle>
            <DialogDescription>{t('quickstart.subtitle')}</DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground">
            {t('quickstart.step').replace('{n}', String(quickStep + 1))}
          </p>

          <p className="font-medium text-sm text-foreground">{quickSteps[quickStep].question}</p>
          <div className="py-1">{quickSteps[quickStep].content}</div>

          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleQuickStartDone}>
              {t('quickstart.skip')}
            </Button>
            <div className="flex-1" />
            {quickStep < quickSteps.length - 1 ? (
              <Button size="sm" onClick={() => setQuickStep(s => s + 1)}>
                {t('quickstart.next')} <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleQuickStartDone}>
                {t('quickstart.done')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default ProfileBuilder;
