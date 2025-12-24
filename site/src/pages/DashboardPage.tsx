import { useEffect, useState } from 'react';
import { useCasperWallet } from '../contexts/CasperWalletContext';
import { getUserStats, getUserHistory, getUserRewards, getVaultInfo, formatCSPR, formatDate } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FaWallet, FaCoins, FaTrophy, FaHistory, FaChartLine, FaUsers, FaBolt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HeroScene } from '../components/three/HeroScene';

export const DashboardPage = () => {
  const { isConnected, account, connect, isConnecting } = useCasperWallet();
  const [userStats, setUserStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [vaultInfo, setVaultInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVaultInfo = async () => {
      try {
        const data = await getVaultInfo();
        setVaultInfo(data);
      } catch (error) {
        console.error('Error fetching vault info:', error);
      }
    };
    fetchVaultInfo();
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      fetchUserData();
    }
  }, [isConnected, account]);

  const fetchUserData = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const [statsData, historyData, rewardsData] = await Promise.all([
        getUserStats(account.publicKey),
        getUserHistory(account.publicKey, 1, 10),
        getUserRewards(account.publicKey),
      ]);

      setUserStats(statsData);
      setTransactions(historyData.transactions || []);
      setRewards(rewardsData.rewards || []);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-cyan-50 font-mono flex items-center justify-center px-6 relative overflow-hidden">
        <div className="fixed inset-0 z-0 opacity-50">
          <HeroScene />
        </div>
        <div className="scanlines" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md relative z-10 p-8 border border-cyan-900/50 bg-black/80 backdrop-blur-md cypher-clip-path"
        >
          <div className="mb-6 relative inline-block">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse" />
            <FaWallet className="text-6xl text-cyan-400 relative z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white tracking-tighter">
            ACCESS_DENIED
          </h2>
          <p className="text-zinc-400 mb-8 border-l-2 border-fuchsia-500 pl-4 text-left">
            // SYSTEM_REQUIREMENT:<br/>
            Connect Casper wallet to initialize dashboard interface and access protocol data.
          </p>
          <Button
            size="lg"
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold tracking-wider border-none cypher-clip-path relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <FaBolt className="mr-2" />
            {isConnecting ? 'ESTABLISHING_LINK...' : 'CONNECT_WALLET'}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-50 font-mono py-12 px-6 relative">
      <div className="fixed inset-0 z-0 opacity-30">
        <HeroScene />
      </div>
      <div className="scanlines" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-cyan-900/30 pb-6 flex flex-col md:flex-row justify-between items-end gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 tracking-tighter">
              DASHBOARD
            </h1>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span className="text-fuchsia-500">&gt;</span>
              USER_ID: <span className="text-cyan-400 font-bold">{account?.publicKey.slice(0, 10)}...{account?.publicKey.slice(-8)}</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link to="/deposit">
              <Button className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold border-none cypher-clip-path relative group overflow-hidden px-8">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <FaCoins className="mr-2" />
                DEPOSIT_FUNDS
              </Button>
            </Link>
            <Link to="/withdraw">
              <Button variant="outline" className="border-2 border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10 font-bold cypher-clip-path-reverse px-8">
                WITHDRAW
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<FaWallet className="text-2xl text-cyan-400" />}
            title="TOTAL_DEPOSITED"
            value={userStats ? `${formatCSPR(userStats.total_deposited)} CSPR` : '0 CSPR'}
            delay={0.1}
            color="cyan"
          />
          <StatCard
            icon={<FaCoins className="text-2xl text-green-400" />}
            title="CURRENT_BALANCE"
            value={userStats ? `${formatCSPR(userStats.current_balance)} CSPR` : '0 CSPR'}
            delay={0.2}
            color="green"
          />
          <StatCard
            icon={<FaTrophy className="text-2xl text-yellow-400" />}
            title="TOTAL_REWARDS"
            value={userStats ? `${formatCSPR(userStats.total_rewards)} CSPR` : '0 CSPR'}
            delay={0.3}
            color="yellow"
          />
          <StatCard
            icon={<FaChartLine className="text-2xl text-fuchsia-400" />}
            title="WIN_COUNT"
            value={userStats?.win_count || 0}
            delay={0.4}
            color="fuchsia"
          />
        </div>

        {/* Vault Info */}
        {vaultInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className="border border-cyan-900/50 bg-black/40 backdrop-blur-sm p-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-500" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-500" />
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-500" />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-500" />
              
              <div className="bg-zinc-900/30 p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                  <FaUsers className="text-cyan-400" />
                  GLOBAL_VAULT_METRICS
                </h3>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="border-l-2 border-cyan-500/30 pl-4">
                    <div className="text-xs text-zinc-500 mb-1 tracking-widest">TOTAL_VALUE_LOCKED</div>
                    <div className="text-3xl font-bold text-cyan-400 text-glow">
                      {formatCSPR(vaultInfo.total_value_locked)} <span className="text-sm text-zinc-500">CSPR</span>
                    </div>
                  </div>
                  <div className="border-l-2 border-fuchsia-500/30 pl-4">
                    <div className="text-xs text-zinc-500 mb-1 tracking-widest">ACTIVE_PARTICIPANTS</div>
                    <div className="text-3xl font-bold text-fuchsia-400 text-glow">
                      {vaultInfo.total_participants}
                    </div>
                  </div>
                  <div className="border-l-2 border-green-500/30 pl-4">
                    <div className="text-xs text-zinc-500 mb-1 tracking-widest">NEXT_DRAW_DATE</div>
                    <div className="text-3xl font-bold text-green-400 text-glow">
                      {new Date(vaultInfo.next_draw_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-cyan-900/30 bg-black/40 backdrop-blur-sm h-full">
              <CardHeader className="border-b border-cyan-900/30">
                <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
                  <FaHistory />
                  TRANSACTION_LOG
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length > 0 ? (
                  <div className="divide-y divide-cyan-900/20">
                    {transactions.map((tx, i) => (
                      <div key={i} className="p-4 hover:bg-cyan-900/10 transition-colors flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'}`} />
                            {tx.type.toUpperCase()}
                          </div>
                          <div className="text-xs text-zinc-500 font-mono mt-1">{formatDate(tx.timestamp)}</div>
                        </div>
                        <div className={`font-bold font-mono ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}{formatCSPR(tx.amount)} CSPR
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 font-mono">
                    // NO_DATA_FOUND
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Rewards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-fuchsia-900/30 bg-black/40 backdrop-blur-sm h-full">
              <CardHeader className="border-b border-fuchsia-900/30">
                <CardTitle className="flex items-center gap-2 text-fuchsia-400 font-mono">
                  <FaTrophy />
                  REWARD_HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {rewards.length > 0 ? (
                  <div className="divide-y divide-fuchsia-900/20">
                    {rewards.map((reward, i) => (
                      <div key={i} className="p-4 hover:bg-fuchsia-900/10 transition-colors flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">PRIZE_WIN</div>
                          <div className="text-xs text-zinc-500 font-mono mt-1">{formatDate(reward.timestamp)}</div>
                        </div>
                        <div className="font-bold text-yellow-400 font-mono text-glow">
                          +{formatCSPR(reward.amount)} CSPR
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 font-mono">
                    // NO_REWARDS_YET
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, delay, color = "cyan" }: any) => {
  const colorClasses = {
    cyan: "border-cyan-500/30 hover:border-cyan-500/60",
    green: "border-green-500/30 hover:border-green-500/60",
    yellow: "border-yellow-500/30 hover:border-yellow-500/60",
    fuchsia: "border-fuchsia-500/30 hover:border-fuchsia-500/60"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-black/40 backdrop-blur-sm border p-6 transition-all group relative overflow-hidden ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
      <div className="relative z-10">
        <div className="text-xs text-zinc-500 mb-2 tracking-widest uppercase font-bold">{title}</div>
        <div className="text-2xl font-bold text-white font-mono">{value}</div>
      </div>
      
      {/* Corner accents */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500 to-transparent opacity-0 group-hover:opacity-50 transition-opacity`} />
    </motion.div>
  );
};
 