import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { loadState, saveState, getDefaultState } from '@/lib/storage';
import { generatePlan, getStatusSnapshot, getTriggeredInstagramCategories, getRankedInstagramAccounts, estimateCRS } from '@/lib/rulesEngine';
import { AppState, GeneratedAction, EisenhowerQuadrant, UserProfile } from '@/types/profile';
import {
  ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Clock, CheckSquare,
  Instagram, List, FileText, AlertCircle, CheckCircle2, Info, UserRound,
  Square, Check,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import BottomNav from '@/components/BottomNav';

/* ─── Status tile colors — semantic tokens only (dark-mode safe) ─── */
const statusConfig: Record<string, { classes: string; Icon: React.ElementType }> = {
  red:   { classes: 'bg-destructive/15 text-destructive border-destructive/30', Icon: AlertCircle },
  yellow:{ classes: 'bg-warning/15 text-warning-foreground border-warning/30',   Icon: Clock },
  green: { classes: 'bg-primary/10 text-primary border-primary/30',              Icon: CheckCircle2 },
  white: { classes: 'bg-background text-muted-foreground border-border',          Icon: Info },
};

/* ─── Counts answerable fields for progress banner ─── */
function countAnsweredFields(p: UserProfile): { answered: number; total: number } {
  const checks = [
    p.age !== null,
    p.immigrationStatus !== null,
    p.province !== '',
    p.maritalStatus !== null,
    p.workingStatus !== null,
    p.canadianEducation !== null,
    p.foreignEducation !== null,
    p.wesStatus !== null,
    !!p.englishTestType,
    !!p.frenchExamType,
    p.canadianWorkMonths > 0,
    p.foreignWorkMonths > 0,
    p.foreignTeer !== 'unknown',
    p.hasSin !== null,
    p.hasPhone !== null,
    p.hasBanking !== null,
    p.healthCoverage !== null,
    p.hasProvincialId !== null,
    p.housingType !== null,
    p.lookingForHousing !== null,
    p.hasRentInsurance !== null,
    p.creditStatus !== null,
    p.needsTaxHelp !== null,
  ];
  return { answered: checks.filter(Boolean).length, total: checks.length };
}

const ActionCardFull = ({
  action,
  isCompleted,
  onToggleDone,
}: {
  action: GeneratedAction;
  isCompleted: boolean;
  onToggleDone: () => void;
}) => {
  const { t } = useLanguage();
  return (
    <div className={`space-y-3 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className={`font-semibold text-base text-foreground flex-1 ${isCompleted ? 'line-through' : ''}`}>
          {action.title}
        </h4>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={onToggleDone}>
          {isCompleted
            ? <CheckCircle2 className="w-4 h-4 text-primary" />
            : <Square className="w-4 h-4 text-muted-foreground" />}
        </Button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" /> {action.estimatedTime}
      </div>
      {!isCompleted && (
        <>
          <div className="space-y-1">
            {action.checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckSquare className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          {action.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {action.links.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="w-3 h-3" /> {l.label}
                </a>
              ))}
            </div>
          )}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <span>{t('results.whySeeThis')}</span>
              <ChevronDown className="w-3 h-3" />
            </CollapsibleTrigger>
            <CollapsibleContent className="text-xs text-muted-foreground mt-2 p-3 bg-muted rounded-md space-y-3">
              <p>{action.reason}</p>
              {action.triggers?.length > 0 && (
                <div>
                  <p className="font-semibold text-foreground mb-1">{t('results.triggeredRules')}:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {action.triggers.map((tr, i) => <li key={i}>{tr}</li>)}
                  </ul>
                </div>
              )}
              {action.scoreBreakdown?.length > 0 && (
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    {t('results.priorityBreakdown')} ({action.priorityScore}/100):
                  </p>
                  <div className="space-y-1">
                    {action.scoreBreakdown.map((b, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{b.factor} ({t('results.weight')} {b.weight}×{b.value})</span>
                        <span className="font-mono font-medium text-foreground">{b.contribution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
};

type QuadrantStyle = { border: string; bg: string; text: string };
const quadrantStyles: Record<EisenhowerQuadrant, QuadrantStyle> = {
  'urgent-important':          { border: 'border-destructive/40',       bg: 'bg-destructive/5',   text: 'text-destructive' },
  'important-not-urgent':      { border: 'border-warning/40',           bg: 'bg-warning/5',       text: 'text-warning-foreground' },
  'urgent-not-important':      { border: 'border-muted-foreground/30',  bg: 'bg-muted/50',        text: 'text-muted-foreground' },
  'not-urgent-not-important':  { border: 'border-primary/30',           bg: 'bg-primary/5',       text: 'text-primary' },
};

const QuadrantModal = ({
  open, onClose, actions, title, completedActions, onToggleDone,
}: {
  open: boolean;
  onClose: () => void;
  actions: GeneratedAction[];
  title: string;
  completedActions: string[];
  onToggleDone: (id: string) => void;
}) => {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const [viewAll, setViewAll] = useState(false);

  const pending = actions.filter(a => !completedActions.includes(a.id));
  const done = actions.filter(a => completedActions.includes(a.id));

  useEffect(() => { if (open) { setPage(0); setViewAll(false); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button size="sm" variant="ghost" className="text-xs gap-1.5 h-7" onClick={() => setViewAll(v => !v)}>
            {viewAll
              ? <><FileText className="w-3 h-3" /> {t('results.viewDetailed')}</>
              : <><List className="w-3 h-3" /> {t('results.viewAll')}</>}
          </Button>
        </div>

        {viewAll ? (
          <div className="space-y-2">
            {actions.map((a, i) => (
              <Card key={a.id} className="border shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium text-sm flex-1 ${completedActions.includes(a.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {i + 1}. {a.title}
                    </h4>
                    <button onClick={() => onToggleDone(a.id)} className="shrink-0">
                      {completedActions.includes(a.id)
                        ? <Check className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          pending.length > 0 ? (
            <div>
              <ActionCardFull
                action={pending[page] ?? pending[0]}
                isCompleted={false}
                onToggleDone={() => onToggleDone((pending[page] ?? pending[0]).id)}
              />
              {pending.length > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-8 gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> {t('results.prev')}
                  </Button>
                  <span className="text-xs text-muted-foreground">{page + 1} / {pending.length}</span>
                  <Button size="sm" variant="outline" disabled={page >= pending.length - 1} onClick={() => setPage(p => p + 1)} className="h-8 gap-1">
                    {t('results.next')} <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              {done.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {t('results.doneSection')} ({done.length})
                  </p>
                  {done.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-muted-foreground line-through flex-1">{a.title}</span>
                      <button onClick={() => onToggleDone(a.id)} className="ml-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-primary" />
              {t('results.doneSection')}
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

const Results = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [state, setState] = useState<AppState>(getDefaultState);
  const [activeQuadrant, setActiveQuadrant] = useState<EisenhowerQuadrant | null>(null);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      const plan = generatePlan(saved.userProfile, lang);
      setState({ ...saved, generatedPlan: plan, completedActions: saved.completedActions ?? [] });
    } else {
      const def = getDefaultState();
      const plan = generatePlan(def.userProfile, lang);
      setState({ ...def, generatedPlan: plan });
    }
  }, [lang]);

  const toggleActionDone = useCallback((actionId: string) => {
    setState(prev => {
      const already = prev.completedActions.includes(actionId);
      const completedActions = already
        ? prev.completedActions.filter(id => id !== actionId)
        : [...prev.completedActions, actionId];
      const updated = { ...prev, completedActions };
      saveState(updated);
      return updated;
    });
  }, []);

  const snapshot = getStatusSnapshot(state.userProfile, state.generatedPlan, lang);
  const triggeredCategories = getTriggeredInstagramCategories(state.userProfile, lang);
  const rankedAccounts = getRankedInstagramAccounts(state.userProfile, triggeredCategories);

  const igCategoryLabels: Record<string, string> = {
    immigration: t('igcat.immigration'),
    taxes: t('igcat.taxes'),
    networking: t('igcat.networking'),
  };

  const accountsByCategory = triggeredCategories.map(tc => ({
    ...tc,
    accounts: rankedAccounts.filter(a => a.category === tc.category),
  })).filter(tc => tc.accounts.length > 0);

  const quadrants: EisenhowerQuadrant[] = [
    'urgent-important', 'important-not-urgent', 'urgent-not-important', 'not-urgent-not-important',
  ];

  const getQuadrantActions = (q: EisenhowerQuadrant) => state.generatedPlan.filter(a => a.quadrant === q);

  const crsScore = estimateCRS(state.userProfile);
  const { answered, total } = countAnsweredFields(state.userProfile);
  const profilePct = Math.round((answered / total) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <h2 className="font-bold text-lg text-foreground">{t('results.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('results.subtitle')}</p>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-6">

        {/* CRS Score Banner */}
        {crsScore > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {t('results.crsTitle')}
                  </p>
                  <p className="text-4xl font-bold text-foreground mt-0.5">{crsScore}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{t('results.crsNote')}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="https://www.cic.gc.ca/english/immigrate/skilled/crs-tool.asp"
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                      <ExternalLink className="w-3 h-3" />
                      {t('results.crsLearnMore')}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-xs">{t('results.crsNote')}</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Completion Banner */}
        {profilePct < 100 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border text-sm">
            <UserRound className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="flex-1 text-muted-foreground text-xs">
              {t('results.progressBanner').replace('{answered}', String(answered)).replace('{total}', String(total))}
            </p>
            <Button size="sm" variant="outline" className="text-xs h-7 shrink-0" onClick={() => navigate('/profile')}>
              {t('results.progressCta')}
            </Button>
          </div>
        )}

        {/* Status snapshot */}
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">{t('results.generalStatus')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {snapshot.map(s => {
              const cfg = statusConfig[s.status] ?? statusConfig.white;
              return (
                <div key={s.label} className={`rounded-xl border p-3 text-center ${cfg.classes}`}>
                  <cfg.Icon className="w-5 h-5 mx-auto" />
                  <p className="text-xs font-medium mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority matrix */}
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">{t('results.priorityMatrix')}</h3>
          <div className="relative pl-10 pb-10">
            <div className="absolute left-0 top-0 bottom-10 flex items-center">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {t('results.axisImportant')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quadrants.map(q => {
                const items = getQuadrantActions(q);
                const pendingCount = items.filter(a => !state.completedActions.includes(a.id)).length;
                const style = quadrantStyles[q];
                return (
                  <div key={q} className={`rounded-xl border-2 ${style.border} ${style.bg} p-4 min-h-[140px] flex flex-col items-center justify-center text-center gap-3`}>
                    <h4 className={`text-[11px] font-bold ${style.text} uppercase tracking-wide`}>
                      {t(`quadrant.${q}`)}
                    </h4>
                    <span className={`text-3xl font-bold ${style.text}`}>{pendingCount}</span>
                    <p className="text-[11px] text-muted-foreground">
                      {pendingCount === 1 ? t('results.recommendation') : t('results.recommendations')}
                    </p>
                    {items.length > 0 && (
                      <Button size="sm" variant="outline" className="text-xs h-7 mt-1" onClick={() => setActiveQuadrant(q)}>
                        {t('results.viewRecommendations')}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-3">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                {t('results.axisUrgent')}
              </span>
            </div>
          </div>
        </div>

        {/* Quadrant detail modal */}
        <QuadrantModal
          open={activeQuadrant !== null}
          onClose={() => setActiveQuadrant(null)}
          actions={activeQuadrant ? getQuadrantActions(activeQuadrant) : []}
          title={activeQuadrant ? t(`quadrant.${activeQuadrant}`) : ''}
          completedActions={state.completedActions}
          onToggleDone={toggleActionDone}
        />

        {/* Instagram recommendations */}
        {accountsByCategory.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Instagram className="w-4 h-4" /> {t('results.instagramTitle')}
            </h3>
            <div className="space-y-3">
              {accountsByCategory.map(tc => (
                <Card key={tc.category} className="border shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm text-foreground">{igCategoryLabels[tc.category]}</h4>
                    <div className="space-y-2">
                      {tc.accounts.map(acc => (
                        <div key={acc.id} className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">{acc.handle}</span>
                          <Button size="sm" variant="outline" className="text-xs gap-1 h-8" asChild>
                            <a href={acc.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" /> {t('btn.openInstagram')}
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <span>{t('results.whySeeThisAlt')}</span>
                        <ChevronDown className="w-3 h-3" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-md">
                        <ul className="list-disc list-inside space-y-0.5">
                          {tc.triggers.map((tr, i) => <li key={i}>{tr}</li>)}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                    <p className="text-[10px] text-muted-foreground italic">{tc.accounts[0]?.disclaimer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {state.generatedPlan.length === 0 && accountsByCategory.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-sm">{t('results.emptyPlan')}</p>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Results;
