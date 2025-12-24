import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CasperWalletProvider } from './contexts/CasperWalletContext';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { Toaster } from 'sonner';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <div className={isLanding ? '' : 'pt-20'}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <CasperWalletProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
          </Routes>
        </Layout>
        <Toaster 
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#000000',
              border: '1px solid #06b6d4',
              color: '#06b6d4',
              fontFamily: 'monospace',
            },
          }}
        />
      </Router>
    </CasperWalletProvider>
  );
}

export default App;
