import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadState, clearState, getDefaultState } from '@/lib/storage';
import { AppState, SectionId } from '@/types/profile';
import { CheckCircle2, Circle, Copy, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import BottomNav from '@/components/BottomNav';

const Settings = () => {
  const { toast } = useToast();
  const { lang, setLang, t } = useLanguage();
  const [state, setState] = useState<AppState>(getDefaultState);
  const [showConfirm, setShowConfirm] = useState(false);

  const sectionKeys: SectionId[] = ['personal', 'education', 'languages', 'work', 'settlement'];

  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
  }, []);

  const exportSummary = () => {
    const lines: string[] = [`${t('export.header')}\n`];
    lines.push(`${t('export.sections')}:`);
    sectionKeys.forEach(s => {
      const name = t(`settings.section.${s}`);
      const status = state.completionStatus[s] === 'complete' ? t('export.complete') : state.completionStatus[s] === 'in-progress' ? t('export.inProgress') : t('export.pending');
      lines.push(`  ${name}: ${status}`);
    });
    lines.push(`\n${t('export.pendingActions')}:`);
    state.generatedPlan.forEach(a => {
      lines.push(`  [${a.quadrant}] ${a.title} (${t('export.priority')}: ${a.priorityScore})`);
    });
    if (state.savedAt) lines.push(`\n${t('export.lastUpdated')}: ${new Date(state.savedAt).toLocaleString(lang === 'pt' ? 'pt-BR' : 'es')}`);

    navigator.clipboard.writeText(lines.join('\n'));
    toast({ title: t('settings.copiedTitle'), description: t('settings.copiedDesc') });
  };

  const handleReset = () => {
    clearState();
    setState(getDefaultState());
    setShowConfirm(false);
    toast({ title: t('settings.deletedTitle'), description: t('settings.deletedDesc') });
  };

  const completedCount = Object.values(state.completionStatus).filter(s => s === 'complete').length;
  const pendingActions = state.generatedPlan.filter(a => a.quadrant === 'urgent-important').length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <h2 className="font-bold text-lg text-foreground">{t('settings.title')}</h2>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-sm">{t('settings.profileProgress')}</h3>
            <div className="text-3xl font-bold text-primary">{completedCount}/5 <span className="text-sm font-normal text-muted-foreground">{t('settings.sectionsCompleted')}</span></div>
            <div className="space-y-2">
              {sectionKeys.map(s => (
                <div key={s} className="flex items-center gap-2">
                  {state.completionStatus[s] === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40" />
                  )}
                  <span className="text-sm text-foreground">{t(`settings.section.${s}`)}</span>
                </div>
              ))}
            </div>
            {pendingActions > 0 && (
              <p className="text-xs text-destructive font-medium">{pendingActions} {t('settings.urgentPending')}</p>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full gap-2" onClick={exportSummary}>
          <Copy className="w-4 h-4" /> {t('settings.exportSummary')}
        </Button>

        {!showConfirm ? (
          <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowConfirm(true)}>
            <Trash2 className="w-4 h-4" /> {t('settings.deleteAll')}
          </Button>
        ) : (
          <Card className="border-destructive/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium text-destructive">{t('settings.deleteConfirm')}</p>
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={handleReset}>
                  <Trash2 className="w-4 h-4 mr-1" /> {t('settings.deleteYes')}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                  <RotateCcw className="w-4 h-4 mr-1" /> {t('settings.deleteCancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-3">{t('settings.language')}</h3>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => setLang('es')}
                className={`font-medium pb-0.5 ${lang === 'es' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('lang.spanish')}
              </button>
              <button
                onClick={() => setLang('pt')}
                className={`font-medium pb-0.5 ${lang === 'pt' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('lang.portuguese')}
              </button>
            </div>
          </CardContent>
        </Card>

        {state.savedAt && (
          <p className="text-xs text-center text-muted-foreground">{t('lastUpdated')}: {new Date(state.savedAt).toLocaleString(lang === 'pt' ? 'pt-BR' : 'es')}</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Settings;
