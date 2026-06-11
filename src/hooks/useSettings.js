// =====================================================
// useSettings Hook - Manage all persistent settings
// =====================================================
import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  apifyToken: '',
  apifyActorId: 'apify~facebook-groups-scraper',
  facebookCookies: '',
  facebookGroupUrls: '',
  n8nWebhookUrl: 'https://rfc-crystal-determining-worth.trycloudflare.com/webhook/chat',
  nvidiaApiKey: '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',
  selectedNiche: 'عمرة',
  customNiche: '',
  googleSheetId: '14kWKZPiFmSaE9_vIBsUnCCyVpZQLsTsRr29Ta8nuqvo',
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('aiLeadHunter_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('aiLeadHunter_settings', JSON.stringify(updated));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('aiLeadHunter_settings');
  };

  return { settings, updateSettings, resetSettings };
}
