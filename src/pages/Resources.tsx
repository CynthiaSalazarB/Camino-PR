import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { mockResources, provincialHealthPlans } from '@/data/mockResources';
import { instagramResources } from '@/data/instagramResources';
import { provinceList } from '@/data/provinces';
import { loadState } from '@/lib/storage';
import { getTriggeredInstagramCategories, getRankedInstagramAccounts } from '@/lib/rulesEngine';
import { UserProfile, InstagramResource } from '@/types/profile';
import { ExternalLink, Filter, Info, Instagram } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import BottomNav from '@/components/BottomNav';

const Resources = () => {
  const { t, lang } = useLanguage();
  const [province, setProvince] = useState('');
  const [category, setCategory] = useState('');
  const [showAllCurated, setShowAllCurated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const categoryLabelsMap: Record<string, string> = {
    telefono: t('cat.telefono'),
    banco: t('cat.banco'),
    salud: t('cat.salud'),
    vivienda: t('cat.vivienda'),
    servicios: t('cat.servicios'),
    networking: t('cat.networking'),
  };

  const allCategoryLabelsMap: Record<string, string> = {
    ...categoryLabelsMap,
    instagram: t('resources.instagram'),
  };

  const igCategoryLabels: Record<string, string> = {
    immigration: t('igcat.immigration'),
    taxes: t('igcat.taxes'),
    networking: t('igcat.networking'),
  };

  const irccAnnouncements = [
    {
      date: t('resources.ircc.date1'),
      title: t('resources.ircc.item1'),
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/02/canada-prioritizes-top-talent-in-2026-immigration-express-entry-categories.html',
    },
    {
      date: t('resources.ircc.date2'),
      title: t('resources.ircc.item2'),
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices.html',
    },
    {
      date: t('resources.ircc.date3'),
      title: t('resources.ircc.item3'),
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/2025/12/bill-c-3-an-act-to-amend-the-citizenship-act-2025-comes-into-effect.html',
    },
  ];

  useEffect(() => {
    const saved = loadState();
    if (saved?.userProfile) {
      if (saved.userProfile.province) setProvince(saved.userProfile.province);
      setProfile(saved.userProfile);
    }
  }, []);

  const filtered = mockResources.filter(r => {
    if (category === 'instagram') return false;
    if (category && category !== 'all' && r.category !== category) return false;
    if (province && province !== 'all' && r.provinces && r.provinces.length > 0 && !r.provinces.includes(province)) return false;
    return true;
  });

  let igAccounts: InstagramResource[] = [];
  if (!category || category === 'all' || category === 'instagram') {
    if (showAllCurated) {
      igAccounts = [...instagramResources];
    } else if (profile) {
      const triggered = getTriggeredInstagramCategories(profile, lang);
      igAccounts = getRankedInstagramAccounts(profile, triggered);
    }
  }

  const healthPlan = province && province !== 'all' ? provincialHealthPlans[province] : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <h2 className="font-bold text-lg text-foreground">{t('resources.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('resources.subtitle')}</p>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* IRCC Announcements */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm text-foreground">{t('resources.ircc.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('resources.ircc.description')}</p>
          </div>
          {irccAnnouncements.map((a, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground">{a.date}</p>
                <p className="text-xs font-medium text-foreground">{a.title}</p>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="w-3 h-3" /> {t('btn.visitSite')}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <h3 className="font-semibold text-sm text-foreground mt-2">{t('resources.otherResources.title')}</h3>

        <div className="flex gap-2">
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger className="flex-1 h-9 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder={t('resources.filterProvince')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('select.allProvinces')}</SelectItem>
              {provinceList.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="flex-1 h-9 text-xs">
              <SelectValue placeholder={t('resources.filterCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('select.all')}</SelectItem>
              {Object.entries(allCategoryLabelsMap).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {(!category || category === 'all' || category === 'instagram') && (
          <div className="flex items-center gap-2">
            <Switch checked={showAllCurated} onCheckedChange={setShowAllCurated} />
            <Label className="text-xs text-muted-foreground">{t('resources.showAllCurated')}</Label>
          </div>
        )}

        {healthPlan && (!category || category === 'all' || category === 'salud') && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-xs font-semibold text-foreground">{t('provincialHealthPlan')}: {healthPlan.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{healthPlan.waitPeriod}</p>
              <a href={healthPlan.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="w-3 h-3" /> {t('moreInfo')} {healthPlan.name}
              </a>
            </CardContent>
          </Card>
        )}

        {igAccounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Instagram className="w-4 h-4" /> {t('resources.instagramCurated')}
            </h3>
            {igAccounts.map(acc => (
              <Card key={acc.id} className="shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{acc.handle}</h4>
                      <p className="text-xs text-muted-foreground">
                        {igCategoryLabels[acc.category]} · {acc.scope}{acc.city ? ` · ${acc.city}` : ''}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{t('curated')}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs gap-1 h-8 w-full" asChild>
                    <a href={acc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" /> {t('btn.openInstagram')}
                    </a>
                  </Button>
                  <p className="text-[10px] text-muted-foreground italic">{acc.disclaimer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {category !== 'instagram' && (
          <div className="space-y-3">
            {filtered.map(r => {
              const tip = province && province !== 'all' && r.provinceTip?.[province];
              return (
                <Card key={r.id} className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{r.name}</h4>
                        <p className="text-xs text-muted-foreground">{categoryLabelsMap[r.category]}</p>
                      </div>
                      {r.budgetFriendly && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">{t('budget')}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-foreground">{r.description}</p>
                    {tip && (
                      <div className="flex items-start gap-1.5 p-2 rounded-md bg-accent/30 border border-accent/50">
                        <Info className="w-3 h-3 mt-0.5 text-accent-foreground shrink-0" />
                        <p className="text-xs text-accent-foreground">{tip}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-medium text-primary mb-1">{t('pros')}</p>
                        {r.pros.map((p, i) => <p key={i} className="text-muted-foreground">• {p}</p>)}
                      </div>
                      <div>
                        <p className="font-medium text-destructive mb-1">{t('cons')}</p>
                        {r.cons.map((c, i) => <p key={i} className="text-muted-foreground">• {c}</p>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="text-xs gap-1 h-8">
                          <ExternalLink className="w-3 h-3" /> {t('btn.visitSite')}
                        </Button>
                      </a>
                    </div>
                    <p className="text-xs text-primary font-medium">→ {r.nextStep}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && igAccounts.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">{t('resources.noResults')}</p>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Resources;
