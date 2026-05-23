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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex flex-col relative overflow-hidden">
      {/* Decorative path elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute w-full h-full opacity-[0.06]" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50 800 Q100 600 200 500 T350 300 T200 100 T300 -50" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="12 8" fill="none" />
          <path d="M450 800 Q300 650 250 550 T100 350 T250 150 T150 -50" stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="8 6" fill="none" />
          <circle cx="200" cy="100" r="6" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx="300" cy="300" r="4" fill="hsl(var(--accent))" opacity="0.4" />
          <circle cx="100" cy="500" r="5" fill="hsl(var(--primary))" opacity="0.25" />
          <circle cx="350" cy="700" r="3" fill="hsl(var(--accent))" opacity="0.35" />
          {/* Maple leaf simplified */}
          <text x="320" y="200" fontSize="24" opacity="0.08">🍁</text>
          <text x="60" y="350" fontSize="20" opacity="0.06">🍁</text>
          <text x="280" y="550" fontSize="18" opacity="0.07">🍁</text>
        </svg>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight whitespace-pre-line">
              {t('welcome.title')}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              {t('welcome.subtitle')}
            </p>
          </div>

          <Card className="border-0 shadow-lg bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex gap-3 items-start">
                <span className="text-xl">📋</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t('welcome.feature1.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('welcome.feature1.desc')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl">🎯</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t('welcome.feature2.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('welcome.feature2.desc')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl">🗂️</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t('welcome.feature3.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('welcome.feature3.desc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>{t('welcome.privacy')}</span>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full text-base font-semibold h-14 rounded-xl"
              onClick={() => navigate('/profile')}
            >
              {t('btn.start')} <ArrowRight className="ml-1 w-5 h-5" />
            </Button>
            {hasData && (
              <Button
                variant="outline"
                size="lg"
                className="w-full text-base h-12 rounded-xl"
                onClick={() => navigate('/results')}
              >
                {t('btn.continueWhereLeft')}
              </Button>
            )}
          </div>

          <div className="flex justify-center gap-3 text-sm">
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
        </div>
      </div>
    </div>
  );
};

export default Welcome;
