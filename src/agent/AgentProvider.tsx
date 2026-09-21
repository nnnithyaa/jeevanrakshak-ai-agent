import type { ReactNode } from 'react';
import { AgentContext } from '@/agent/AgentContext';
import { useAgent } from '@/agent/useAgent';

export function AgentProvider({ children }: { children: ReactNode }) {
  const agent = useAgent();
  return <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>;
}
