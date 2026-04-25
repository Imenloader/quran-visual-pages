import React from 'react';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';
import { useTheme } from '@/contexts/ThemeContext';

const DynamicThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { phase } = useDynamicTheme();
  const { atmosphericBackground } = useTheme();

  return (
    <div className={atmosphericBackground ? "dynamic-bg min-h-screen" : "min-h-screen"}>
      {children}
    </div>
  );
};

export default DynamicThemeWrapper;
