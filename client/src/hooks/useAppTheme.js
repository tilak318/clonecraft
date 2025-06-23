import { useMemo } from 'react';

const glassyTheme = {
  primaryColor: '#3d5af1',      // A strong, professional blue
  secondaryColor: '#7b8cde',    // Muted blue for secondary elements
  backgroundColor: 'rgba(27, 39, 64, 0.6)',  // Semi-transparent dark blue for panels
  textColor: '#f0f0f0',
  borderColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  successColor: '#00e676',      // Bright green for success
  dangerColor: '#ff3d71',       // Hot pink/red for danger
  warningColor: '#ffc107',
  infoColor: '#00e676',
  lightColor: 'rgba(255, 255, 255, 0.1)',  // Lighter transparent white for hovers
  darkColor: '#121929',
  transition: 'all 0.3s ease',
};

export const useAppTheme = () => {
  return useMemo(() => glassyTheme, []);
}; 