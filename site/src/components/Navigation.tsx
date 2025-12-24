import { Link, useLocation } from 'react-router-dom';
import { useCasperWallet } from '../contexts/CasperWalletContext';
import { Button } from './ui/button';
import { FaBolt, FaWallet } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const Navigation = () => {
  const { isConnected, account, connect, disconnect, isConnecting } = useCasperWallet();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-cyan-900/30 font-mono">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <FaBolt className="text-3xl text-cyan-400 group-hover:text-fuchsia-500 transition-colors relative z-10" />
              <div className="absolute inset-0 bg-cyan-400 blur-md opacity-50 group-hover:bg-fuchsia-500 transition-colors" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
              SPARK<span className="text-fuchsia-500">_PROTOCOL</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" active={isActive('/')}>
              // HOME
            </NavLink>
            <NavLink to="/dashboard" active={isActive('/dashboard')}>
              // DASHBOARD
            </NavLink>
            <NavLink to="/deposit" active={isActive('/deposit')}>
              // DEPOSIT
            </NavLink>
            <NavLink to="/withdraw" active={isActive('/withdraw')}>
              // WITHDRAW
            </NavLink>
          </div>

          {/* Wallet Connection */}
          <div>
            {isConnected && account ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-xs text-cyan-400 border border-cyan-900 bg-cyan-950/30 px-3 py-1 rounded-sm">
                  {account.publicKey.slice(0, 6)}...{account.publicKey.slice(-4)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="border-red-500 text-red-400 hover:bg-red-500/10 cypher-clip-path-reverse rounded-none"
                >
                  DISCONNECT
                </Button>
              </div>
            ) : (
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold border-none cypher-clip-path rounded-none relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <FaWallet className="mr-2" />
                {isConnecting ? 'CONNECTING...' : 'CONNECT_WALLET'}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4 mt-4 overflow-x-auto pb-2">
          <NavLink to="/" active={isActive('/')} mobile>
            HOME
          </NavLink>
          <NavLink to="/dashboard" active={isActive('/dashboard')} mobile>
            DASHBOARD
          </NavLink>
          <NavLink to="/deposit" active={isActive('/deposit')} mobile>
            DEPOSIT
          </NavLink>
          <NavLink to="/withdraw" active={isActive('/withdraw')} mobile>
            WITHDRAW
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, active, children, mobile }: any) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        ${mobile ? 'text-sm px-3 py-1' : 'text-sm px-2 py-1'}
        whitespace-nowrap transition-all relative group
        ${
          active
            ? 'text-cyan-400 font-bold'
            : 'text-zinc-500 hover:text-cyan-200'
        }
      `}
    >
      {active && (
        <span className="absolute -left-3 text-fuchsia-500 animate-pulse">&gt;</span>
      )}
      {children}
      <div className={`h-0.5 bg-cyan-500 absolute bottom-0 left-0 transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
    </motion.div>
  </Link>
);
        

