import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { PredictionsPage } from '@/pages/PredictionsPage';
import { ShortagePage } from '@/pages/ShortagePage';
import { RedistributionPage } from '@/pages/RedistributionPage';
import { EmergencyPage } from '@/pages/EmergencyPage';
import { SimulationPage } from '@/pages/SimulationPage';
import { AgentProvider } from '@/agent/AgentProvider';
import type { PageId } from '@/types';

function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState<PageId>('dashboard');

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  const pages: Record<PageId, React.ReactNode> = {
    dashboard: <DashboardPage />,
    inventory: <InventoryPage />,
    predictions: <PredictionsPage />,
    shortage: <ShortagePage />,
    redistribution: <RedistributionPage />,
    emergency: <EmergencyPage />,
    simulation: <SimulationPage />,
  };

  return (
    <AgentProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          activePage={page}
          onNavigate={setPage}
          onLogout={() => setAuthed(false)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-6">
            {pages[page]}
          </div>
        </main>
      </div>
    </AgentProvider>
  );
}

export default App;
