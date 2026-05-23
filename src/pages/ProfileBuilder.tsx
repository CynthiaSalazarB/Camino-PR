import { useState, useEffect, useRef, useCallback } from 'react';
import prCardImg from '@/assets/pr-card.jpg';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { loadState, saveState, getDefaultState } from '@/lib/storage';
import { generatePlan } from '@/lib/rulesEngine';
import { UserProfile, AppState } from '@/types/profile';
import { Save, CheckCircle2, HelpCircle, ArrowRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import BottomNav from '@/components/BottomNav';

/* ───── layout constants ───── */
const CW = 1200, CH = 800;
const CX = CW / 2, CY = CH / 2;

interface NodeDef {
  id: string;
  labelKey: string;
  x: number;
  y: number;
}

interface SectionDef {
  id: string;
  titleKey: string;
  emoji: string;
  colorClass: string;
  x: number;
  y: number;
  children: NodeDef[];
  side: 'left' | 'right';
}

function buildSections(): SectionDef[] {
  // Children still needed for completion checks, but positions don't matter (not rendered on canvas)
  return [
    {
      id: 'personal', titleKey: 'mindmap.personal', emoji: '👤',
      colorClass: 'bg-mindmap-personal', x: CX - 200, y: CY - 140, side: 'left',
      children: [
        { id: 'age', labelKey: 'profile.age', x: 0, y: 0 },
        { id: 'canadianEdu', labelKey: 'profile.canadianEducation', x: 0, y: 0 },
        { id: 'foreignEdu', labelKey: 'profile.foreignEducation', x: 0, y: 0 },
        { id: 'englishExam', labelKey: 'profile.englishExam', x: 0, y: 0 },
        { id: 'frenchExam', labelKey: 'profile.frenchExam', x: 0, y: 0 },
        { id: 'workCanada', labelKey: 'profile.workCanada', x: 0, y: 0 },
        { id: 'workForeign', labelKey: 'profile.workForeign', x: 0, y: 0 },
        { id: 'marital', labelKey: 'profile.maritalStatus', x: 0, y: 0 },
        { id: 'working', labelKey: 'profile.workingStatus', x: 0, y: 0 },
      ],
    },
    {
      id: 'services', titleKey: 'mindmap.services', emoji: '🏦',
      colorClass: 'bg-mindmap-services', x: CX - 200, y: CY + 140, side: 'left',
      children: [
        { id: 'phone', labelKey: 'profile.phone', x: 0, y: 0 },
        { id: 'banking', labelKey: 'profile.banking', x: 0, y: 0 },
        { id: 'health', labelKey: 'profile.health', x: 0, y: 0 },
        { id: 'credit', labelKey: 'profile.credit', x: 0, y: 0 },
      ],
    },
    {
      id: 'housing', titleKey: 'mindmap.housing', emoji: '🏠',
      colorClass: 'bg-mindmap-housing', x: CX + 200, y: CY - 140, side: 'right',
      children: [
        { id: 'housingType', labelKey: 'profile.housing', x: 0, y: 0 },
        { id: 'lookingHousing', labelKey: 'profile.lookingForHousing', x: 0, y: 0 },
        { id: 'houseInsurance', labelKey: 'profile.houseInsurance', x: 0, y: 0 },
      ],
    },
    {
      id: 'docs', titleKey: 'mindmap.docs', emoji: '📄',
      colorClass: 'bg-mindmap-docs', x: CX + 200, y: CY + 140, side: 'right',
      children: [
        { id: 'immigration', labelKey: 'profile.immigrationStatus', x: 0, y: 0 },
        { id: 'provincialId', labelKey: 'profile.provincialId', x: 0, y: 0 },
        { id: 'sinNumber', labelKey: 'profile.sinNumber', x: 0, y: 0 },
      ],
    },
  ];
}

/* ───── component ───── */
const ProfileBuilder = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [state, setState] = useState<AppState>(getDefaultState);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  /* ── section complete alert ── */
  const [completedAlert, setCompletedAlert] = useState<string | null>(null);
  const alertedSections = useRef<Set<string>>(new Set());

  /* ── camera pan state ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  /* ── touch gesture refs (mobile) ── */
  const touchStartDist = useRef(0);
  const touchStartZoom = useRef(1);
  const lastTouchCount = useRef(0);
  const touchPanStart = useRef({ x: 0, y: 0 });
  const touchPanOrigin = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-section-node]')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
    containerRef.current?.setPointerCapture(e.pointerId);
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, [pan]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isPanning.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, []);

  /* ── touch handlers (mobile pinch-to-zoom + fast pan) ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-section-node]')) return;
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      touchStartZoom.current = zoom;
      lastTouchCount.current = 2;
    } else if (e.touches.length === 1) {
      lastTouchCount.current = 1;
      touchPanStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchPanOrigin.current = { ...pan };
    }
  }, [zoom, pan]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[data-section-node]')) return;
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDist.current;
      setZoom(Math.min(Math.max(touchStartZoom.current * scale, 0.4), 2));
      lastTouchCount.current = 2;
    } else if (e.touches.length === 1 && lastTouchCount.current !== 2) {
      const speedFactor = 1.8;
      const dx = (e.touches[0].clientX - touchPanStart.current.x) * speedFactor;
      const dy = (e.touches[0].clientY - touchPanStart.current.y) * speedFactor;
      setPan({ x: touchPanOrigin.current.x + dx, y: touchPanOrigin.current.y + dy });
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      lastTouchCount.current = 0;
    }
  }, []);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setState(saved);
    }
  }, []);

  const p = state.userProfile;
  const updateProfile = (updates: Partial<UserProfile>) => {
    setState(prev => {
      const next = { ...prev, userProfile: { ...prev.userProfile, ...updates } };
      saveState(next);
      return next;
    });
  };

  const handleSave = () => saveState(state);

  const handleGeneratePlan = () => {
    const plan = generatePlan(state.userProfile, lang);
    const finalState = { ...state, generatedPlan: plan };
    saveState(finalState);
    setState(finalState);
    navigate('/results');
  };

  const isNodeComplete = (id: string): boolean => {
    switch (id) {
      case 'age': return p.age !== null;
      case 'canadianEdu': return p.canadianEducation !== null;
      case 'foreignEdu': return p.foreignEducation !== null;
      case 'englishExam': return !!p.englishTestType;
      case 'frenchExam': return !!p.frenchExamType;
      case 'workCanada': return p.canadianWorkMonths > 0;
      case 'workForeign': return p.foreignWorkMonths > 0;
      case 'marital': return p.maritalStatus !== null;
      case 'working': return p.workingStatus !== null;
      case 'phone': return p.hasPhone !== null;
      case 'banking': return p.hasBanking !== null;
      case 'health': return p.healthCoverage !== null;
      case 'credit': return p.knowsCreditScore !== null;
      case 'housingType': return p.housingType !== null;
      case 'lookingHousing': return p.lookingForHousing !== null;
      case 'houseInsurance': return p.hasRentInsurance !== null;
      case 'immigration': return p.immigrationStatus !== null;
      case 'provincialId': return p.hasProvincialId !== null;
      case 'sinNumber': return p.hasSin !== null;
      default: return false;
    }
  };

  const isSectionComplete = (sec: SectionDef) => sec.children.every(ch => isNodeComplete(ch.id));

  /* ── check section completeness after sheet closes ── */
  const checkSectionComplete = useCallback(() => {
    const secs = buildSections();
    for (const sec of secs) {
      if (alertedSections.current.has(sec.id)) continue;
      const allDone = sec.children.every(ch => isNodeComplete(ch.id));
      if (allDone) {
        alertedSections.current.add(sec.id);
        setCompletedAlert(sec.id);
        break;
      }
    }
  }, [state.userProfile]);

  const sections = buildSections();
  const CIRCLE_R = 60;
  const SECTION_W = 240;
  const SECTION_H = 50;

  /* ───── SVG lines (only section→center) ───── */
  const renderLines = () => {
    return sections.map(sec => (
      <line key={`${sec.id}-center`} x1={sec.x} y1={sec.y} x2={CX} y2={CY}
        stroke="hsl(var(--border))" strokeWidth={1.5} />
    ));
  };

  /* ───── Section form content ───── */
  const renderSectionForm = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return (
          <div className="space-y-6">
            {/* Age */}
            <div className="space-y-2">
              <Label>{t('profile.age')}</Label>
              <Input type="number" placeholder={t('profile.age.placeholder')} value={p.age ?? ''} onChange={e => updateProfile({ age: e.target.value ? parseInt(e.target.value) : null })} />
            </div>

            {/* Canadian Education */}
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

            {/* Foreign Education + WES */}
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

            {/* English Exam */}
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

            {/* French Exam */}
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

            {/* Canadian Work Experience */}
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

            {/* Foreign Work Experience */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('profile.workForeign')} — {t('profile.workYears')}</Label>
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[250px]"><p className="text-xs">{t('profile.workTeerTooltip')}</p></TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" placeholder={t('profile.workYears.placeholder')} min={0}
                value={p.foreignWorkMonths ? Math.round(p.foreignWorkMonths / 12) : ''}
                onChange={e => updateProfile({ foreignWorkMonths: (parseInt(e.target.value) || 0) * 12 })} />
            </div>

            {/* Marital Status */}
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
              <Input type="number" placeholder={t('profile.children.placeholder')} min={0} value={p.childrenCount || ''} onChange={e => updateProfile({ childrenCount: parseInt(e.target.value) || 0 })} />
            </div>

            {/* Working Status */}
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

      case 'services':
        return (
          <div className="space-y-6">
            {/* Phone */}
            <div className="space-y-2">
              <Label>{t('profile.hasPhone')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasPhone === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasPhone: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasPhone === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasPhone: false })}>{t('btn.no')}</Button>
              </div>
            </div>

            {/* Banking */}
            <div className="space-y-2">
              <Label>{t('profile.hasBanking')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasBanking === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasBanking: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasBanking === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasBanking: false })}>{t('btn.no')}</Button>
              </div>
            </div>

            {/* Health Coverage */}
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

            {/* Credit Score */}
            <div className="space-y-2">
              <Label>{t('profile.knowsCreditScore')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.knowsCreditScore === true ? 'default' : 'outline'} onClick={() => updateProfile({ knowsCreditScore: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.knowsCreditScore === false ? 'default' : 'outline'} onClick={() => updateProfile({ knowsCreditScore: false })}>{t('btn.no')}</Button>
              </div>
            </div>
          </div>
        );

      case 'housing':
        return (
          <div className="space-y-6">
            {/* Housing Type */}
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

            {/* Looking for Housing */}
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

            {/* House Insurance */}
            <div className="space-y-2">
              <Label>{t('profile.hasRentInsurance')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasRentInsurance === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasRentInsurance: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasRentInsurance === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasRentInsurance: false })}>{t('btn.no')}</Button>
              </div>
            </div>
          </div>
        );

      case 'docs':
        return (
          <div className="space-y-6">
            {/* Immigration Status */}
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

            {/* Provincial ID */}
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

            {/* SIN Number */}
            <div className="space-y-2">
              <Label>{t('profile.hasSin')}</Label>
              <div className="flex gap-2">
                <Button className="flex-1" variant={p.hasSin === true ? 'default' : 'outline'} onClick={() => updateProfile({ hasSin: true })}>{t('btn.yes')}</Button>
                <Button className="flex-1" variant={p.hasSin === false ? 'default' : 'outline'} onClick={() => updateProfile({ hasSin: false })}>{t('btn.no')}</Button>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  const activeSectionData = activeSection ? sections.find(s => s.id === activeSection) : null;
  const alertSectionTitle = completedAlert ? t(sections.find(s => s.id === completedAlert)?.titleKey || '') : '';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="font-bold text-lg text-foreground">{t('profile.title')}</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave} className="text-xs gap-1">
            <Save className="w-3.5 h-3.5" /> {t('btn.save')}
          </Button>
          <Button size="sm" onClick={handleGeneratePlan} className="text-xs gap-1">
            {t('btn.generatePlan')} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Mind Map – camera pan + zoom */}
      <div
        ref={containerRef}
        className="overflow-hidden flex-1 relative select-none touch-none"
        style={{ cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(2, z + 0.15))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
        <div
          className="relative"
          style={{ width: CW, height: CH, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* SVG lines layer */}
          <svg className="absolute inset-0 pointer-events-none z-0" width={CW} height={CH}>
            {renderLines()}
          </svg>

          {/* Center – PR card image + label */}
          <div
            className="absolute flex flex-col items-center justify-center"
            style={{ left: CX - CIRCLE_R * 1.4, top: CY - CIRCLE_R - 10, width: CIRCLE_R * 2.8 }}
          >
            <div
              className="rounded-xl overflow-hidden shadow-lg border-2 border-primary"
              style={{ width: CIRCLE_R * 2.8, height: CIRCLE_R * 1.8 }}
            >
              <img
                src={prCardImg}
                alt="Permanent Resident Card"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <span className="mt-1 font-bold text-sm text-foreground whitespace-nowrap">Camino PR</span>
          </div>

          {/* Section nodes – clickable */}
          {sections.map(sec => {
            const complete = isSectionComplete(sec);
            const completedCount = sec.children.filter(ch => isNodeComplete(ch.id)).length;
            return (
              <div
                key={sec.id}
                data-section-node
                onClick={() => setActiveSection(sec.id)}
                className={`absolute flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm shadow-sm border border-border/50 z-10 ${sec.colorClass} cursor-pointer hover:scale-105 transition-transform`}
                style={{ left: sec.x - SECTION_W / 2, top: sec.y - SECTION_H / 2, width: SECTION_W, height: SECTION_H }}
              >
                <span className="text-lg">{sec.emoji}</span>
                <span className="truncate flex-1">{t(sec.titleKey)}</span>
                {complete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <span className="text-xs text-muted-foreground flex-shrink-0">{completedCount}/{sec.children.length}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Sheet */}
      <Sheet open={!!activeSection} onOpenChange={open => {
        if (!open) {
          handleSave();
          setActiveSection(null);
          setTimeout(checkSectionComplete, 100);
        }
      }}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto sm:max-w-lg sm:mx-auto rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              {activeSectionData && <span className="text-xl">{activeSectionData.emoji}</span>}
              {activeSectionData && t(activeSectionData.titleKey)}
            </SheetTitle>
            <SheetDescription className="text-xs">{t('mindmap.clickToFill')}</SheetDescription>
          </SheetHeader>
          {activeSection && renderSectionForm(activeSection)}
          <div className="pt-6 pb-2">
            <Button className="w-full" onClick={() => {
              handleSave();
              setActiveSection(null);
              setTimeout(checkSectionComplete, 100);
            }}>{t('btn.done')}</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Section Complete Alert */}
      <AlertDialog open={!!completedAlert} onOpenChange={open => { if (!open) setCompletedAlert(null); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('alert.sectionComplete.title')} — {alertSectionTitle}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>{t('alert.sectionComplete.recommendations')}</p>
                <p>{t('alert.sectionComplete.editable')}</p>
                <p>{t('alert.sectionComplete.save')}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t('alert.sectionComplete.ok')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default ProfileBuilder;
