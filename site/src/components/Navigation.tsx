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
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <FaBolt className="text-3xl text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              SPARK
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" active={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/dashboard" active={isActive('/dashboard')}>
              Dashboard
            </NavLink>
            <NavLink to="/deposit" active={isActive('/deposit')}>
              Deposit
            </NavLink>
            <NavLink to="/withdraw" active={isActive('/withdraw')}>
              Withdraw
            </NavLink>
          </div>

          {/* Wallet Connection */}
          <div>
            {isConnected && account ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-zinc-400">
                  {account.publicKey.slice(0, 6)}...{account.publicKey.slice(-4)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0"
              >
                <FaWallet className="mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4 mt-4 overflow-x-auto">
          <NavLink to="/" active={isActive('/')} mobile>
            Home
          </NavLink>
          <NavLink to="/dashboard" active={isActive('/dashboard')} mobile>
            Dashboard
          </NavLink>
          <NavLink to="/deposit" active={isActive('/deposit')} mobile>
            Deposit
          </NavLink>
          <NavLink to="/withdraw" active={isActive('/withdraw')} mobile>
            Withdraw
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
        ${mobile ? 'text-sm px-3 py-1' : 'text-base px-2 py-1'}
        whitespace-nowrap rounded-md transition-colors
        ${
          active
            ? 'text-cyan-400 font-medium'
            : 'text-zinc-400 hover:text-zinc-100'
        }
      `}
    >
      {children}
    </motion.div>
  </Link>
);
