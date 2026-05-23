import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { loadState, getDefaultState } from '@/lib/storage';
import { generatePlan, getStatusSnapshot, getTriggeredInstagramCategories, getRankedInstagramAccounts } from '@/lib/rulesEngine';
import { AppState, GeneratedAction, EisenhowerQuadrant } from '@/types/profile';
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Clock, CheckSquare, Instagram, List, FileText } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import BottomNav from '@/components/BottomNav';

const statusColors: Record<string, string> = { red: 'bg-destructive/15 text-destructive border-destructive/30', yellow: 'bg-accent/50 text-accent-foreground border-accent', green: 'bg-primary/10 text-primary border-primary/30', white: 'bg-background text-muted-foreground border-border' };

const ActionCardFull = ({ action }: { action: GeneratedAction }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-base text-foreground">{action.title}</h4>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" /> {action.estimatedTime}
      </div>
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
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
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
          {action.triggers && action.triggers.length > 0 && (
            <div>
              <p className="font-semibold text-foreground mb-1">{t('results.triggeredRules')}:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {action.triggers.map((tr, i) => <li key={i}>{tr}</li>)}
              </ul>
            </div>
          )}
          {action.scoreBreakdown && action.scoreBreakdown.length > 0 && (
            <div>
              <p className="font-semibold text-foreground mb-1">{t('results.priorityBreakdown')} ({action.priorityScore}/100):</p>
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
    </div>
  );
};

type QuadrantStyle = { border: string; bg: string; text: string };

const quadrantStyles: Record<EisenhowerQuadrant, QuadrantStyle> = {
  'urgent-important': { border: 'border-destructive/40', bg: 'bg-destructive/5', text: 'text-destructive' },
  'important-not-urgent': { border: 'border-accent/60', bg: 'bg-accent/10', text: 'text-accent-foreground' },
  'urgent-not-important': { border: 'border-muted-foreground/30', bg: 'bg-muted/50', text: 'text-muted-foreground' },
  'not-urgent-not-important': { border: 'border-primary/30', bg: 'bg-primary/5', text: 'text-primary' },
};

const QuadrantModal = ({ open, onClose, actions, title }: { open: boolean; onClose: () => void; actions: GeneratedAction[]; title: string }) => {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const [viewAll, setViewAll] = useState(false);

  // Reset on open
  useEffect(() => { if (open) { setPage(0); setViewAll(false); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button size="sm" variant="ghost" className="text-xs gap-1.5 h-7" onClick={() => setViewAll(v => !v)}>
            {viewAll ? <><FileText className="w-3 h-3" /> {t('results.viewDetailed')}</> : <><List className="w-3 h-3" /> {t('results.viewAll')}</>}
          </Button>
        </div>

        {viewAll ? (
          <div className="space-y-2">
            {actions.map((a, i) => (
              <Card key={a.id} className="border shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-foreground">{i + 1}. {a.title}</h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.estimatedTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          actions.length > 0 && (
            <div>
              <ActionCardFull action={actions[page]} />
              {actions.length > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-8 gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> {t('results.prev')}
                  </Button>
                  <span className="text-xs text-muted-foreground">{page + 1} / {actions.length}</span>
                  <Button size="sm" variant="outline" disabled={page === actions.length - 1} onClick={() => setPage(p => p + 1)} className="h-8 gap-1">
                    {t('results.next')} <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

const Results = () => {
  const { t, lang } = useLanguage();
  const [state, setState] = useState<AppState>(getDefaultState);
  const [activeQuadrant, setActiveQuadrant] = useState<EisenhowerQuadrant | null>(null);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      // Always regenerate plan from current profile data
      const plan = generatePlan(saved.userProfile, lang);
      setState({ ...saved, generatedPlan: plan });
    } else {
      // No saved state — generate plan from default (empty) profile
      const def = getDefaultState();
      const plan = generatePlan(def.userProfile, lang);
      setState({ ...def, generatedPlan: plan });
    }
  }, [lang]);

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

  const quadrants: EisenhowerQuadrant[] = ['urgent-important', 'important-not-urgent', 'urgent-not-important', 'not-urgent-not-important'];

  const getQuadrantActions = (q: EisenhowerQuadrant) => state.generatedPlan.filter(a => a.quadrant === q);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <h2 className="font-bold text-lg text-foreground">{t('results.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('results.subtitle')}</p>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-6">
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">{t('results.generalStatus')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {snapshot.map(s => (
              <div key={s.label} className={`rounded-xl border p-3 text-center ${statusColors[s.status]}`}>
                <span className="text-xl">{s.icon}</span>
                <p className="text-xs font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">{t('results.priorityMatrix')}</h3>

          <div className="relative pl-10 pb-10">
            {/* Y-axis label */}
            <div className="absolute left-0 top-0 bottom-10 flex items-center">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {t('results.axisImportant')}
              </span>
            </div>

            {/* 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {quadrants.map(q => {
                const items = getQuadrantActions(q);
                const style = quadrantStyles[q];
                return (
                  <div key={q} className={`rounded-xl border-2 ${style.border} ${style.bg} p-4 min-h-[140px] flex flex-col items-center justify-center text-center gap-3`}>
                    <h4 className={`text-[11px] font-bold ${style.text} uppercase tracking-wide`}>{t(`quadrant.${q}`)}</h4>
                    <span className={`text-3xl font-bold ${style.text}`}>{items.length}</span>
                    <p className="text-[11px] text-muted-foreground">
                      {items.length === 1 ? t('results.recommendation') : t('results.recommendations')}
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

            {/* X-axis label */}
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
        />

        {accountsByCategory.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Instagram className="w-4 h-4" /> {t('results.instagramTitle')}
            </h3>
            <div className="space-y-3">
              {accountsByCategory.map(tc => (
                <Card key={tc.category} className="border shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm text-foreground">
                      {igCategoryLabels[tc.category]}
                    </h4>
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
