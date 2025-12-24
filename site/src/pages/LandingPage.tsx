import { Link } from 'react-router-dom';
import { HeroScene } from '../components/three/HeroScene';
import { Button } from '../components/ui/button';
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
    <div className="min-h-screen bg-black text-cyan-50 font-mono selection:bg-cyan-500/30">
      <div className="scanlines" />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-lg blur opacity-20 animate-pulse" />
            <h1 className="relative text-7xl md:text-9xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-500 text-glow filter drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              SPARK
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl mb-4 text-cyan-400 font-bold tracking-widest uppercase"
          >
            No-Loss Prize Vault // CASPER
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl mb-12 text-zinc-400 max-w-3xl mx-auto border-l-2 border-fuchsia-500 pl-6 text-left bg-black/40 backdrop-blur-sm p-4"
          >
            <span className="text-fuchsia-500 mr-2">&gt;</span>
            Initialize protocol: <span className="text-white">STAKE CSPR</span><br/>
            <span className="text-fuchsia-500 mr-2">&gt;</span>
            Execute: <span className="text-white">EARN REWARDS</span><br/>
            <span className="text-fuchsia-500 mr-2">&gt;</span>
            Outcome: <span className="text-white">WIN PRIZES</span><br/>
            <span className="text-green-500 mr-2">&gt;</span>
            Risk Assessment: <span className="text-green-400">0% (PRINCIPAL SECURED)</span>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/dashboard">
              <Button size="lg" className="cypher-clip-path text-lg px-10 py-8 bg-cyan-600 hover:bg-cyan-500 text-black font-bold tracking-wider border-none relative group overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <FaRocket className="mr-2" />
                LAUNCH_APP
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="cypher-clip-path-reverse text-lg px-10 py-8 border-2 border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400 font-bold tracking-wider bg-black/50 backdrop-blur-md"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              SYSTEM_INFO
            </Button>
          </motion.div>

          {/* Stats Bar */}
          {vaultInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <StatsCard 
                label="TOTAL_VALUE_LOCKED" 
                value={`${formatCSPR(vaultInfo.total_value_locked)} CSPR`}
                color="cyan"
              />
              <StatsCard 
                label="ACTIVE_NODES" 
                value={formatNumber(vaultInfo.total_participants)}
                color="fuchsia"
              />
              <StatsCard 
                label="REWARDS_DISTRIBUTED" 
                value={`${formatCSPR(vaultInfo.total_rewards_distributed)} CSPR`}
                color="green"
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-zinc-950 relative" id="how-it-works">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-16 border-b border-cyan-900 pb-4"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-2 text-white">
              SYSTEM_<span className="text-cyan-500">FEATURES</span>
            </h2>
            <p className="text-xl text-zinc-500 font-mono">
              // NEXT_GEN_DEFI_SAVINGS_PROTOCOL
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaShieldAlt className="text-4xl text-cyan-400" />}
              title="PRINCIPAL_PROTECTED"
              description="Immutable smart contracts ensure 100% safety of deposited assets. Zero loss vectors identified."
              delay={0.1}
            />
            <FeatureCard
              icon={<FaTrophy className="text-4xl text-fuchsia-400" />}
              title="PRIZE_ALGORITHM"
              description="Weekly provably fair RNG selection. Pooled yield distribution to lucky winners."
              delay={0.2}
            />
            <FeatureCard
              icon={<FaChartLine className="text-4xl text-green-400" />}
              title="YIELD_GENERATION"
              description="8-12% APY via native network staking. Automated compound cycles."
              delay={0.3}
            />
            <FeatureCard
              icon={<FaCoins className="text-4xl text-yellow-400" />}
              title="LIQUID_TOKENS"
              description="Minted pvCSPR represents share ownership. Fully composable in DeFi ecosystem."
              delay={0.4}
            />
            <FeatureCard
              icon={<FaLock className="text-4xl text-blue-400" />}
              title="TRUSTLESS_CORE"
              description="Decentralized architecture. No admin keys. Code is law."
              delay={0.5}
            />
            <FeatureCard
              icon={<FaRocket className="text-4xl text-red-400" />}
              title="INSTANT_ACCESS"
              description="Permissionless entry. Connect wallet and execute deposit transaction immediately."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              EXECUTION_<span className="text-fuchsia-500">PROTOCOL</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            <StepCard
              number="01"
              title="INIT_DEPOSIT"
              description="Connect Casper wallet. Transfer CSPR to vault contract. Receive pvCSPR."
            />
            <StepCard
              number="02"
              title="YIELD_FARMING"
              description="Assets automatically delegated to validators. Yield accrues in prize pool."
            />
            <StepCard
              number="03"
              title="PRIZE_DISTRIBUTION"
              description="Weekly epoch ends. VRF selects winner. Prize distributed. Principal remains."
            />
            <StepCard
              number="04"
              title="EXIT_STRATEGY"
              description="Burn pvCSPR to redeem underlying CSPR + base yield at any time."
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <Link to="/dashboard">
              <Button size="lg" className="cypher-clip-path text-xl px-16 py-10 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold tracking-widest border-none box-glow">
                START_PROTOCOL
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const StatsCard = ({ label, value, color }: any) => {
  const colorClasses = {
    cyan: "text-cyan-400 border-cyan-500/30",
    fuchsia: "text-fuchsia-400 border-fuchsia-500/30",
    green: "text-green-400 border-green-500/30"
  };
  
  return (
    <div className={`bg-black/60 backdrop-blur-md border ${colorClasses[color as keyof typeof colorClasses]} p-6 cypher-clip-path relative group`}>
      <div className={`absolute top-0 right-0 w-4 h-4 border-t border-r ${colorClasses[color as keyof typeof colorClasses].split(' ')[1].replace('/30', '')}`} />
      <div className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} font-mono`}>
        {value}
      </div>
      <div className="text-zinc-500 text-xs mt-2 tracking-widest uppercase">{label}</div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="h-full bg-zinc-900/40 border border-zinc-800 p-6 hover:border-cyan-500/50 transition-colors group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="mb-6 relative z-10 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-zinc-100 group-hover:text-cyan-400 transition-colors font-mono">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-600 group-hover:border-cyan-500 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-600 group-hover:border-cyan-500 transition-colors" />
    </div>
  </motion.div>
);

const StepCard = ({ number, title, description }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="flex gap-8 items-start group"
  >
    <div className="flex-shrink-0 w-20 h-20 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-700 group-hover:text-fuchsia-500 group-hover:border-fuchsia-500/50 transition-all cypher-clip-path">
      {number}
    </div>
    <div className="pt-2">
      <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-fuchsia-400 transition-colors font-mono">{title}</h3>
      <p className="text-zinc-500 max-w-xl">{description}</p>
    </div>
  </motion.div>
);
