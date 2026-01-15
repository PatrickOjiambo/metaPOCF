import { useState } from 'react';
import { useCasperWallet } from '../contexts/CasperWalletContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FaMoneyBillWave, FaCheckCircle, FaInfoCircle, FaClock, FaBolt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeroScene } from '../components/three/HeroScene';

const withdrawSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be greater than 0',
    }),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

export const WithdrawPage = () => {
  const { isConnected, account, connect } = useCasperWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [deployHash, setDeployHash] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
  });

  const onSubmit = async (data: WithdrawFormData) => {
    if (!isConnected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Stub implementation - In production, this would interact with the Casper contract
      const amount = parseFloat(data.amount);
      
      // Simulate a delay for "processing"
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate a stub deploy hash
      const stubDeployHash = `ee914f89ac5881f613c017162123d9004600b442983997c8a3fb40e1734e6cb4`;
      setDeployHash(stubDeployHash);
      
      // Show success
      setWithdrawSuccess(true);
      toast.success(`Withdrawal of ${amount} CSPR initiated!`);
      
      reset();
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      toast.error(`Withdrawal failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
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
            <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-20 animate-pulse" />
            <FaMoneyBillWave className="text-6xl text-fuchsia-400 relative z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white tracking-tighter">
            AUTHENTICATION_REQUIRED
          </h2>
          <p className="text-zinc-400 mb-8 border-l-2 border-cyan-500 pl-4 text-left">
            // PROTOCOL_LOCK:<br/>
            Connect Casper wallet to initiate withdrawal sequence.
          </p>
          <Button
            size="lg"
            onClick={connect}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold tracking-wider border-none cypher-clip-path relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <FaBolt className="mr-2" />
            CONNECT_WALLET
          </Button>
        </motion.div>
      </div>
    );
  }

  if (withdrawSuccess) {
    return (
      <div className="min-h-screen bg-black text-cyan-50 font-mono flex items-center justify-center px-6 relative overflow-hidden">
        <div className="scanlines" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md relative z-10 p-8 border border-green-900/50 bg-black/80 backdrop-blur-md cypher-clip-path"
        >
          <div className="mb-6 relative inline-block">
            <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse" />
            <FaCheckCircle className="text-6xl text-green-400 relative z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white tracking-tighter">
            WITHDRAWAL_INITIATED
          </h2>
          <p className="text-zinc-400 mb-6">
            Unstaking process started. Funds will be released after network lock-up period.
          </p>
          <div className="bg-zinc-900/50 border border-cyan-500/20 p-4 mb-6 text-left font-mono">
            <div className="text-xs text-zinc-500 mb-1 uppercase tracking-widest">Withdrawal initiated</div>
            {/* <div className="text-xs text-cyan-400 break-all">{deployHash}</div> */}
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <FaClock className="text-yellow-400 mt-1" />
              <div className="text-sm text-zinc-300">
                <strong className="text-yellow-400 uppercase tracking-wider">Unstaking Period:</strong><br/>
                Standard network delay (7-14 days) applies before liquid CSPR is available.
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => {
                setWithdrawSuccess(false);
                setDeployHash('');
              }}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 cypher-clip-path-reverse"
            >
              NEW_WITHDRAWAL
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold border-none cypher-clip-path"
            >
              DASHBOARD
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-50 font-mono py-12 px-6 relative">
      <div className="scanlines" />
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-b border-fuchsia-900/30 pb-6"
        >
          <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-500 tracking-tighter">
            WITHDRAW_FUNDS
          </h1>
          <p className="text-zinc-400 flex items-center gap-2">
            <span className="text-cyan-500">&gt;</span>
            Burn pvCSPR to redeem underlying assets + yield
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-fuchsia-900/50 bg-black/40 backdrop-blur-sm cypher-border">
            <CardHeader>
              <CardTitle className="text-fuchsia-400 font-mono uppercase tracking-widest">Redemption_Parameters</CardTitle>
              <CardDescription className="text-zinc-500">Input withdrawal amount to exit position</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <Label htmlFor="amount" className="text-zinc-300 uppercase tracking-wider text-xs mb-2 block">Amount (CSPR)</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      {...register('amount')}
                      className="bg-zinc-900/50 border-fuchsia-900/50 text-fuchsia-400 font-mono text-lg h-12 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">CSPR</div>
                  </div>
                  {errors.amount && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div className="bg-fuchsia-900/10 border border-fuchsia-500/20 p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500/50" />
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-fuchsia-400 mt-1 flex-shrink-0" />
                    <div className="text-sm text-zinc-300 font-mono">
                      <p className="mb-2 font-bold text-fuchsia-400">
                        // EXIT_PROTOCOL:
                      </p>
                      <ul className="space-y-1 text-zinc-400">
                        <li>1. pvCSPR tokens burned from wallet</li>
                        <li>2. Unstaking request sent to validators</li>
                        <li>3. 7-14 day lock-up period begins</li>
                        <li>4. Principal + Rewards released to wallet</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold tracking-wider border-none cypher-clip-path h-14 text-lg relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {isSubmitting ? (
                    <span className="animate-pulse">PROCESSING_EXIT...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaMoneyBillWave /> CONFIRM_WITHDRAWAL
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
