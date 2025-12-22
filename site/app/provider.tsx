'use client';

import { createContext, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { ThemeModeType } from '@make-software/csprclick-ui';
import { AppTheme } from "@/components/theme";
import { ActiveAccountType } from '@/types';
import useCsprClick from '@/hooks/use-cspr-click';
import { CsprClickInitOptions } from '@make-software/csprclick-core-client';
import { ClickProvider } from '@make-software/csprclick-ui';
import { CONTENT_MODE } from '@make-software/csprclick-core-types';

export const ActiveAccountContext =
  createContext<ActiveAccountType | null>(null);

const clickOptions: CsprClickInitOptions = {
  appName: "MetaPOCF DApp",
  contentMode: CONTENT_MODE.IFRAME,
  providers: [
    'casper-wallet',
    'ledger',
    'torus-wallet',
    'casperdash',
    'metamask-snap',
    'casper-signer',
  ],
  appId: " config.cspr_click_app_id",
};

export function Providers({ children }: { children: ReactNode }) {
  const { activeAccount } = useCsprClick();

  return (
    <ClickProvider options={clickOptions}>
      <ThemeProvider theme={AppTheme[ThemeModeType.light]}>
        <ActiveAccountContext.Provider value={activeAccount}>
          {children}
        </ActiveAccountContext.Provider>
      </ThemeProvider>
    </ClickProvider>
  );
}
