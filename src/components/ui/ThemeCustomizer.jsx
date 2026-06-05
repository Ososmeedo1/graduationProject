import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Moon, Sun, Monitor, X, Layers, Box, AppWindow } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import useSound from '../../hooks/useSound';

const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    themeMode,
    setThemeMode,
    appAppearance,
    setAppAppearance,
    availableAppearances,
    motionEnabled,
    setMotionEnabled
  } = useTheme();
  const { soundEnabled, setSoundEnabled, soundProfile, setSoundProfile, soundVolume, setSoundVolume } = useSound();
  const { t } = useTranslation();

  const appearanceIcons = {
    modern: <AppWindow className="w-5 h-5 mb-1" />,
    glass: <Layers className="w-5 h-5 mb-1" />,
    classic: <Box className="w-5 h-5 mb-1" />,
    '3d': <Box className="w-5 h-5 mb-1" />
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className="p-2 text-ink-muted hover:text-primary-600 hover:bg-surface-inset rounded-full relative transition-all duration-300 hover:rotate-90 hover:scale-105"
        aria-label="Theme Customization"
      >
        <Settings className="w-5 h-5" />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[9999] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div
            className={`absolute top-0 rtl:left-0 rtl:right-auto right-0 h-full w-80 max-w-full bg-surface shadow-2xl border-l rtl:border-l-0 rtl:border-r border-stroke transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
              }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
                  {t('theme.customizer', 'Theme Customizer')}
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-surface-inset rounded-full transition-colors">
                  <X className="w-5 h-5 text-ink-muted" />
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-4">{t('theme.mode', 'Color Mode')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${themeMode === 'light' ? 'border-primary-500 bg-primary-500/10 text-primary-600 ring-2 ring-primary-500 shadow-sm' : 'border-stroke hover:bg-surface-muted text-ink-muted'}`}
                  >
                    <Sun className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Light</span>
                  </button>

                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${themeMode === 'dark' ? 'border-primary-500 bg-primary-500/10 text-primary-600 ring-2 ring-primary-500 shadow-sm' : 'border-stroke hover:bg-surface-muted text-ink-muted'}`}
                  >
                    <Moon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Dark</span>
                  </button>

                  <button
                    onClick={() => {
                      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      setThemeMode(isDark ? 'dark' : 'light');
                    }}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl border border-stroke hover:bg-surface-muted text-ink-muted transition-all focus:outline-none"
                  >
                    <Monitor className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">System</span>
                  </button>
                </div>
              </div>

              {/* Appearance Switcher */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-4">{t('theme.appearance', 'Style Appearance')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {availableAppearances.map((style) => (
                    <button
                      key={style}
                      onClick={() => setAppAppearance(style)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all capitalize ${appAppearance === style ? 'border-primary-500 bg-primary-500/10 text-primary-600 ring-2 ring-primary-500 shadow-sm' : 'border-stroke hover:bg-surface-muted text-ink-muted'}`}
                    >
                      {appearanceIcons[style]}
                      <span className="text-xs font-semibold">{style}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Effects */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-4">{t('theme.soundEffects', 'Sound Effects')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSoundEnabled(true)}
                    className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all ${soundEnabled ? 'border-primary-500 bg-primary-500/10 text-primary-600 ring-2 ring-primary-500 shadow-sm' : 'border-stroke hover:bg-surface-muted text-ink-muted'}`}
                  >
                    <span className="text-xs font-semibold">{t('common.on', 'On')}</span>
                  </button>
                  <button
                    onClick={() => setSoundEnabled(false)}
                    data-sound="off"
                    className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all ${!soundEnabled ? 'border-primary-500 bg-primary-500/10 text-primary-600 ring-2 ring-primary-500 shadow-sm' : 'border-stroke hover:bg-surface-muted text-ink-muted'}`}
                  >
                    <span className="text-xs font-semibold">{t('common.off', 'Off')}</span>
                  </button>
                </div>
              </div>

              {/* Sound Style */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-4">{t('theme.soundStyle', 'Sound Style')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['modern', 'soft', 'tech'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setSoundProfile(style)}
                      className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all capitalize ${soundProfile === style ? 'border-primary-500 bg-primary-500/10 text-primary-600 ring-2 ring-primary-500 shadow-sm' : 'border-stroke hover:bg-surface-muted text-ink-muted'}`}
                    >
                      <span className="text-xs font-semibold">{style}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Volume */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider">{t('theme.soundVolume', 'Sound Volume')}</h3>
                  <span className="text-xs font-semibold text-ink-muted">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="5"
                  value={Math.round(soundVolume * 100)}
                  onChange={(event) => setSoundVolume(Number(event.target.value) / 100)}
                  className="w-full accent-primary-500"
                  aria-label={t('theme.soundVolume', 'Sound Volume')}
                />
              </div>

              {/* Animations */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-4">{t('theme.animations', 'Animations')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMotionEnabled(true)}
                    className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all ${motionEnabled ? 'border-primary-500 bg-primary-500/10 text-primary-600 ring-2 ring-primary-500 shadow-sm' : 'border-stroke hover:bg-surface-muted text-ink-muted'}`}
                  >
                    <span className="text-xs font-semibold">{t('common.on', 'On')}</span>
                  </button>
                  <button
                    onClick={() => setMotionEnabled(false)}
                    className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all ${!motionEnabled ? 'border-primary-500 bg-primary-500/10 text-primary-600 ring-2 ring-primary-500 shadow-sm' : 'border-stroke hover:bg-surface-muted text-ink-muted'}`}
                  >
                    <span className="text-xs font-semibold">{t('common.off', 'Off')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>, document.body)}
    </>
  );
};

export default ThemeCustomizer;