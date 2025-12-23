import { Link } from 'react-router-dom';
import { HeroScene } from '../components/three/HeroScene';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FaRocket, FaShieldAlt, FaTrophy, FaCoins, FaChartLine, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getVaultInfo } from '../lib/api';
import { formatCSPR, formatNumber } from '../lib/api';

export const LandingPage = () => {
  const [vaultInfo, setVaultInfo] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              SPARK
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-cyan-400 font-light">
              No-Loss Prize Vault on Casper
            </p>
            <p className="text-lg md:text-xl mb-8 text-zinc-400 max-w-3xl mx-auto">
              Maximize your returns with decentralized prize-linked savings. Stake CSPR, earn rewards, 
              and win substantial prizes—all while keeping your principal 100% safe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0">
                  <FaRocket className="mr-2" />
                  Launch App
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Stats Bar */}
          {vaultInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-cyan-400">
                  {formatCSPR(vaultInfo.total_value_locked)} CSPR
                </div>
                <div className="text-zinc-400 text-sm mt-1">Total Value Locked</div>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-cyan-400">
                  {formatNumber(vaultInfo.total_participants)}
                </div>
                <div className="text-zinc-400 text-sm mt-1">Active Participants</div>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-cyan-400">
                  {formatCSPR(vaultInfo.total_rewards_distributed)} CSPR
                </div>
                <div className="text-zinc-400 text-sm mt-1">Rewards Distributed</div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-zinc-900/50" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              The Future of DeFi Savings
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Earn more than traditional staking. No risk, all reward.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaShieldAlt className="text-4xl text-cyan-400" />}
              title="100% Principal Protected"
              description="Your deposits are always safe. Withdraw anytime with your full amount plus accumulated rewards. Zero risk of loss."
              delay={0.1}
            />
            <FeatureCard
              icon={<FaTrophy className="text-4xl text-yellow-400" />}
              title="Weekly Prize Draws"
              description="Win substantial prizes from pooled staking rewards. More deposits = better odds. Top prize can be worth thousands of CSPR."
              delay={0.2}
            />
            <FeatureCard
              icon={<FaChartLine className="text-4xl text-green-400" />}
              title="8-12% Base APY"
              description="Earn Casper's native staking rewards automatically. All deposits are staked on-chain, generating consistent returns."
              delay={0.3}
            />
            <FeatureCard
              icon={<FaCoins className="text-4xl text-purple-400" />}
              title="Liquid pvCSPR Tokens"
              description="Receive tradeable tokens representing your share. Use them in other DeFi protocols or hold for prizes."
              delay={0.4}
            />
            <FeatureCard
              icon={<FaLock className="text-4xl text-blue-400" />}
              title="Decentralized & Trustless"
              description="Fully on-chain smart contracts. No intermediaries. Verifiable randomness for fair prize selection."
              delay={0.5}
            />
            <FeatureCard
              icon={<FaRocket className="text-4xl text-cyan-400" />}
              title="Instant Participation"
              description="Connect your wallet, deposit CSPR, and you're in. Start earning and competing for prizes immediately."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              How It Works
            </h2>
          </motion.div>

          <div className="space-y-8">
            <StepCard
              number="01"
              title="Deposit CSPR"
              description="Connect your Casper wallet and deposit any amount of CSPR tokens into the prize vault. Receive pvCSPR tokens in return."
            />
            <StepCard
              number="02"
              title="Earn Staking Rewards"
              description="Your deposits are automatically staked on Casper Network, earning 8-12% APY. Rewards accumulate in the vault's prize pool."
            />
            <StepCard
              number="03"
              title="Win Prizes"
              description="Every week, winners are selected from the prize pool. Your chances increase with deposit size and duration. No one loses their principal."
            />
            <StepCard
              number="04"
              title="Withdraw Anytime"
              description="Exit whenever you want. Withdraw your full deposit plus any base rewards earned. It's your money, always accessible."
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 text-center"
          >
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0">
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-y border-cyan-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Maximize Your Returns?
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Join hundreds of users earning more with prize-linked savings. Your capital is safe, your potential unlimited.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0">
                  Launch App
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    <Card className="h-full border-cyan-500/20 bg-zinc-900/50 backdrop-blur-sm hover:border-cyan-500/40 transition-all">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-zinc-400">{description}</CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const StepCard = ({ number, title, description }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="flex gap-6 items-start"
  >
    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold">
      {number}
    </div>
    <div>
      <h3 className="text-2xl font-bold mb-2 text-cyan-400">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  </motion.div>
);
