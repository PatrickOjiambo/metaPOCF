import { useEffect, useState } from 'react';
import { useCasperWallet } from '../contexts/CasperWalletContext';
import { getUserStats, getUserHistory, getUserRewards, getVaultInfo, formatCSPR, formatDate } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FaWallet, FaCoins, FaTrophy, FaHistory, FaChartLine, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <FaWallet className="text-6xl text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-zinc-50">Connect Your Wallet</h2>
          <p className="text-zinc-400 mb-8">
            Connect your Casper wallet to access your dashboard and start earning rewards.
          </p>
          <Button
            size="lg"
            onClick={connect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-zinc-400">
            {account?.publicKey.slice(0, 10)}...{account?.publicKey.slice(-8)}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          <Link to="/deposit">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0">
              <FaCoins className="mr-2" />
              Deposit
            </Button>
          </Link>
          <Link to="/withdraw">
            <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
              Withdraw
            </Button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaWallet className="text-2xl text-cyan-400" />}
            title="Total Deposited"
            value={userStats ? `${formatCSPR(userStats.total_deposited)} CSPR` : '0 CSPR'}
            delay={0.2}
          />
          <StatCard
            icon={<FaCoins className="text-2xl text-green-400" />}
            title="Current Balance"
            value={userStats ? `${formatCSPR(userStats.current_balance)} CSPR` : '0 CSPR'}
            delay={0.3}
          />
          <StatCard
            icon={<FaTrophy className="text-2xl text-yellow-400" />}
            title="Total Rewards"
            value={userStats ? `${formatCSPR(userStats.total_rewards)} CSPR` : '0 CSPR'}
            delay={0.4}
          />
          <StatCard
            icon={<FaChartLine className="text-2xl text-purple-400" />}
            title="Wins"
            value={userStats?.win_count || 0}
            delay={0.5}
          />
        </div>

        {/* Vault Info */}
        {vaultInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="border-cyan-500/20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaUsers className="text-cyan-400" />
                  Vault Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Total Value Locked</div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {formatCSPR(vaultInfo.total_value_locked)} CSPR
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Total Participants</div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {vaultInfo.total_participants}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Next Draw</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {new Date(vaultInfo.next_draw_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-cyan-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaHistory className="text-cyan-400" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Your latest activity</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-zinc-400 py-8">Loading...</div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((tx, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
                      >
                        <div>
                          <div className="font-medium">{tx.type}</div>
                          <div className="text-sm text-zinc-400">
                            {formatDate(tx.timestamp)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-cyan-400">
                            {formatCSPR(tx.amount)} CSPR
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-zinc-400 py-8">
                    No transactions yet. Make your first deposit!
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Prize History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-cyan-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" />
                  Prize History
                </CardTitle>
                <CardDescription>Your winnings</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-zinc-400 py-8">Loading...</div>
                ) : rewards.length > 0 ? (
                  <div className="space-y-4">
                    {rewards.map((reward, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20"
                      >
                        <div>
                          <div className="font-medium">Rank #{reward.rank}</div>
                          <div className="text-sm text-zinc-400">
                            {formatDate(reward.timestamp)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-yellow-400">
                            {formatCSPR(reward.amount)} CSPR
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-zinc-400 py-8">
                    No prizes won yet. Keep depositing to increase your odds!
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

const StatCard = ({ icon, title, value, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="border-cyan-500/20 bg-zinc-900/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div>{icon}</div>
          <div>
            <div className="text-sm text-zinc-400 mb-1">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
