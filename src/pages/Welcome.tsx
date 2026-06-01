import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { hasSavedState } from '@/lib/storage';
import { Shield, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const Welcome = () => {
  const navigate = useNavigate();
  const hasData = hasSavedState();
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">

      {/* ── Hero strip ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border shrink-0">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute w-full h-full opacity-[0.08]" viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50 260 Q100 180 200 140 T350 80 T200 20 T300 -10"
              stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="12 8" fill="none" />
            <path d="M450 260 Q300 200 250 160 T100 100 T250 40 T150 -10"
              stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="8 6" fill="none" />
            <text x="310" y="70"  fontSize="22" opacity="0.14">🍁</text>
            <text x="50"  y="120" fontSize="18" opacity="0.11">🍁</text>
          </svg>
        </div>

        <div className="relative z-10 px-5 pt-8 pb-6 text-center space-y-2 max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 shadow-sm mb-1">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight whitespace-pre-line leading-tight">
            {t('welcome.title')}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Content body — grouped block, no stretch gap ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 min-h-0 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-5">

          {/* Feature list */}
          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-3 items-center">
                <span className="text-lg shrink-0">📋</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t('welcome.feature1.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('welcome.feature1.desc')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-lg shrink-0">🎯</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t('welcome.feature2.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('welcome.feature2.desc')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-lg shrink-0">🗂️</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t('welcome.feature3.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('welcome.feature3.desc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom cluster — privacy + CTAs + language */}
          <div className="flex flex-col gap-3">
            {/* Privacy note */}
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>{t('welcome.privacy')}</span>
            </div>

            {/* CTA buttons */}
            <Button
              size="lg"
              className="w-full text-base font-semibold h-12 rounded-xl"
              onClick={() => navigate('/profile')}
            >
              {t('btn.start')} <ArrowRight className="ml-1 w-5 h-5" />
            </Button>
            {hasData && (
              <Button
                variant="outline"
                size="lg"
                className="w-full text-base h-11 rounded-xl"
                onClick={() => navigate('/results')}
              >
                {t('btn.continueWhereLeft')}
              </Button>
            )}

            {/* Language toggle */}
            <div className="flex justify-center gap-4 text-sm pb-1">
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
              <button
                onClick={() => setLang('en')}
                className={`font-medium pb-0.5 ${lang === 'en' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('lang.english')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Welcome;
