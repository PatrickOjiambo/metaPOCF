import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CasperWalletProvider } from './contexts/CasperWalletContext';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <CasperWalletProvider>
      <Router>
        <div className="min-h-screen bg-zinc-950">
          <Navigation />
          <div className="pt-20">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/deposit" element={<DepositPage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
            </Routes>
          </div>
          <Toaster 
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#fafafa',
              },
            }}
          />
        </div>
      </Router>
    </CasperWalletProvider>
  );
}

export default App;
