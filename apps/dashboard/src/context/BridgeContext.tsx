import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { AppState } from '../types';
import type { Action } from '../reducer';

export interface BridgeContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  reconnect: () => void;
}

export const BridgeContext = createContext<BridgeContextValue | null>(null);

export function useBridge(): BridgeContextValue {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error('useBridge must be used within BridgeProvider');
  return ctx;
}
