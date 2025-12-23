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
import { FaCoins, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const depositSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be greater than 0',
    })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 10, {
      message: 'Minimum deposit is 10 CSPR',
    }),
});

type DepositFormData = z.infer<typeof depositSchema>;

export const DepositPage = () => {
  const { isConnected, account, connect } = useCasperWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [deployHash, setDeployHash] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const onSubmit = async (data: DepositFormData) => {
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
      const stubDeployHash = `stub_deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setDeployHash(stubDeployHash);
      
      // Show success
      setDepositSuccess(true);
      toast.success(`Successfully deposited ${amount} CSPR!`);
      
      // In production, you would:
      // 1. Create a deploy with the contract entry point
      // 2. Sign it with the wallet
      // 3. Send it to the network
      // 4. Wait for confirmation
      // Example:
      // const deploy = createDeployForDeposit(amount, account.publicKey);
      // const signedDeploy = await signDeploy(deploy);
      // const deployHash = await sendDeploy(signedDeploy);

      reset();
    } catch (error: any) {
      console.error('Error depositing:', error);
      toast.error(`Deposit failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
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
          <FaCoins className="text-6xl text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-zinc-50">Connect Your Wallet</h2>
          <p className="text-zinc-400 mb-8">
            Connect your Casper wallet to deposit CSPR and start earning.
          </p>
          <Button
            size="lg"
            onClick={connect}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0"
          >
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    );
  }

  if (depositSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            <FaCheckCircle className="text-6xl text-green-400 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-zinc-50">Deposit Successful!</h2>
          <p className="text-zinc-400 mb-6">
            Your CSPR has been deposited and is now earning rewards. You'll receive pvCSPR tokens shortly.
          </p>
          <div className="bg-zinc-900/50 border border-cyan-500/20 rounded-lg p-4 mb-8">
            <div className="text-sm text-zinc-400 mb-1">Deploy Hash</div>
            <div className="text-xs text-cyan-400 break-all font-mono">{deployHash}</div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => {
                setDepositSuccess(false);
                setDeployHash('');
              }}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              Make Another Deposit
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0"
            >
              View Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Deposit CSPR
          </h1>
          <p className="text-zinc-400">Stake your CSPR to earn rewards and win prizes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-cyan-500/20 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Deposit Amount</CardTitle>
              <CardDescription>Enter the amount of CSPR you want to deposit</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="amount">Amount (CSPR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    {...register('amount')}
                    className="mt-2"
                  />
                  {errors.amount && (
                    <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
                  )}
                </div>

                <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                    <div className="text-sm text-zinc-300">
                      <p className="mb-2">
                        <strong>What happens next:</strong>
                      </p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Your CSPR will be staked on Casper Network</li>
                        <li>You'll receive pvCSPR tokens representing your share</li>
                        <li>Start earning 8-12% APY automatically</li>
                        <li>Eligible for weekly prize draws</li>
                        <li>Withdraw anytime with no penalties</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <FaCoins className="mr-2" />
                      Deposit CSPR
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="border-yellow-500/20 bg-yellow-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-yellow-400 mt-1" />
                <div className="text-sm text-zinc-300">
                  <strong className="text-yellow-400">Important:</strong> Your deposit will be
                  locked in staking. While you can withdraw anytime, there may be an unstaking
                  period before funds are available. Your principal is always safe.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
