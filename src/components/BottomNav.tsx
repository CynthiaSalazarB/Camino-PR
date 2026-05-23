import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, BarChart3, BookOpen, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const tabs = [
  { path: '/', icon: Home, key: 'nav.home' },
  { path: '/profile', icon: User, key: 'nav.profile' },
  { path: '/results', icon: BarChart3, key: 'nav.plan' },
  { path: '/resources', icon: BookOpen, key: 'nav.resources' },
  { path: '/settings', icon: Settings, key: 'nav.settings' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{t(tab.key)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
