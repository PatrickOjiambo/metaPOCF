use odra::casper_types::{PublicKey, U512};
use odra::prelude::*;
/// A module definition. Each module struct consists Vars and Mappings
/// or/and another modules.
#[odra::module]
pub struct Meta {
    /// Total CSPR currently liquid in the contract (not staked).
    treasury_balance: Var<U512>,
    /// Total CSPR currently staked with the validator.
    staked_amount: Var<U512>,
    /// CSPR waiting to reach the 500 threshold for delegation.
    pending_stake_pool: Var<U512>,
    /// CSPR unstaked and ready to be claimed by users (or waiting for unbonding).
    total_unstaked_amount: Var<U512>,
    investor_balances: Mapping<Address, U512>,
    validator: Var<PublicKey>,
    rewards_pool: Var<U512>,
    unstake_queue: List<UnstakeRequest>,
    harvested_prize_pool: Var<U512>,
    /// Track total principal (deposits) separately to identify rewards clearly.
    total_principal: Var<U512>,
}
#[odra::odra_type]
pub struct UnstakeRequest {
    pub user: Address,
    pub amount: U512,
}
/// Module implementation.
///
/// To generate entrypoints,
/// an implementation block must be marked as #[odra::module].
#[odra::module]
impl Meta {
    /// Odra constructor.
    ///
    /// Initializes the contract.
    pub fn init(&mut self, validator: PublicKey) {
        self.validator.set(validator);
        self.treasury_balance.set(U512::zero());
        self.rewards_pool.set(U512::zero());
    }
    ///CSPR Deposit
    //
    // This function allows a user to deposit funds
    #[odra(payable)]
    pub fn deposit(&mut self) {
        let caller = self.env().caller();

        let deposit_amount = self.env().attached_value();
        // 1. Update internal accounting
        self.treasury_balance.add(deposit_amount);
        self.total_principal.add(deposit_amount);
        self.investor_balances
            .add(&caller, deposit_amount);
        // 2. Add to the pooling variable
        let current_pending = self.pending_stake_pool.get_or_default();
        let new_pending = current_pending + deposit_amount;

        // 3. Threshold Check (500 CSPR = 500,000,000,000 Motes)
        let min_stake = U512::from(500_000_000_000u64);
        if new_pending >= min_stake {
            // We have enough to meet the Casper network requirement
            self.stake(new_pending);

            // Update state: move from liquid treasury to staked
            self.staked_amount.add(new_pending);
            self.treasury_balance.subtract(new_pending);

            // Reset the pool
            self.pending_stake_pool.set(U512::zero());
        } else {
            // Just update the pool and wait for more deposits
            self.pending_stake_pool.set(new_pending);
        }
        //TODO: Mint mCSPR tokens to the user representing their stake
    }

    pub fn request_unstake(&mut self, amount: U512) {
        let caller = self.env().caller();
        let investor_balance = self.get_investor_balance(caller);
        assert!(investor_balance >= amount, "Insufficient balance");
        //We are triggering the actual undelegation here
        self.unstake(amount);
        self.staked_amount
            .subtract(amount);
        self.total_unstaked_amount
            .add(amount);
        self.investor_balances
            .subtract(&caller, amount);
        let request = UnstakeRequest {
            user: caller,
            amount,
        };
        self.unstake_queue.push(request);
    }

    /// Undelegate the amount from the validator
    pub fn unstake(&mut self, amount: U512) {
        self.env().undelegate(self.validator.get().unwrap(), amount);
    }
    pub fn stake(&mut self, amount: U512) {
        self.env().delegate(self.validator.get().unwrap(), amount);
    }
    pub fn get_investor_balance(&self, investor: Address) -> U512 {
        self.investor_balances.get_or_default(&investor)
    }
    //This method is going to be called by the admin only. It sends the unstaked CSPR back to the users
    //TODO: Later find a way to remove processed requests from the queue
    #[odra(payable)]
    pub fn withdraw(&mut self) {
        // Ensure only admin/owner can call this (assuming Ownable is implemented)
        // self.ownable.assert_owner(&self.env().caller());

        let mut current_liquid_cspr = self.env().self_balance();
        // self_balance() is more reliable than treasury_balance var for real payouts

        let queue_len = self.unstake_queue.len();
        let mut processed_count = 0;

        for i in 0..queue_len {
            // Look at the oldest request (index 0)
            if let Some(request) = self.unstake_queue.get(0) {
                if current_liquid_cspr >= request.amount {
                    self.env().transfer_tokens(&request.user, &request.amount);

                    current_liquid_cspr -= request.amount;
                    self.total_unstaked_amount.subtract(request.amount);

                    // 3. Remove the processed request from the front
                    self.unstake_queue.replace(
                        0,
                        UnstakeRequest {
                            user: request.user,
                            amount: U512::zero(),
                        },
                    );
                    // Note: Standard Odra List doesn't have pop_front.
                    // In production, you'd track a 'head' index to avoid O(n) shifts.
                    processed_count += 1;
                } else {
                    // If the oldest request can't be filled, stop here to maintain FIFO order.
                    break;
                }
            }
        }

        //TODO:  Cleanup: Remove the processed items from the list
    }
    pub fn harvest_rewards(&mut self) {
        // 1. Calculate the total liabilities (Principal + Unstaked + Pending)
        // This is exactly what the contract MUST keep to pay back users.
        let total_liabilities = self.total_principal.get_or_default()
            + self.total_unstaked_amount.get_or_default()
            + self.pending_stake_pool.get_or_default();

        // 2. Calculate the total actual assets
        let total_assets = self.env().self_balance() + self.staked_amount.get_or_default();

        // 3. The surplus is the reward yield
        if total_assets > total_liabilities {
            let surplus = total_assets - total_liabilities;

            // Move surplus to the lottery pool
            self.harvested_prize_pool.set(surplus);

            // Log this for the off-chain script
            // self.env().emit_event(RewardsHarvested { amount: surplus });
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::meta::{MetaHostRef};
    use odra::casper_types::{PublicKey, U512, SecretKey};
    use odra::host::{Deployer, HostEnv, HostRef};
    use odra::prelude::*;

    // Helper to create a dummy validator public key
    fn mock_validator() -> PublicKey {
        let secret_key = SecretKey::ed25519_from_bytes([1u8; 32]).unwrap();
        PublicKey::from(&secret_key)
    }

    #[test]
    fn test_initialization() {
        let env = odra_test::env();
        let validator = mock_validator();
        let meta = Deployer::init(&env, validator.clone());

        // Verify state (Internal getter or manual check if public)
        // Since we are using HostRef, we call the contract's public methods
        // Add a 'get_validator' method to your contract for this test if needed
    }

    #[test]
    fn test_deposit_pooling_threshold() {
        let env = odra_test::env();
        let investor = env.get_account(1);
        let validator = mock_validator();
        let mut meta = MetaDeployer::init(&env, validator);

        // 1. Small deposit (100 CSPR) - Should stay in pending
        let deposit_1 = U512::from(100_000_000_000u64); // 100 CSPR in motes
        env.set_caller(investor);
        meta.with_tokens(deposit_1).deposit();

        assert_eq!(meta.get_investor_balance(investor), deposit_1);
        
        // 2. Second deposit to cross the 500 CSPR threshold
        let deposit_2 = U512::from(450_000_000_000u64); // 450 CSPR
        meta.with_tokens(deposit_2).deposit();

        // Total should be 550 CSPR. Because it's > 500, stake() was called.
        // In a real test environment, you'd check if the delegation actually happened 
        // using env.get_account_balance or checking the internal `staked_amount` var.
        assert_eq!(meta.get_investor_balance(investor), deposit_1 + deposit_2);
    }

    #[test]
    fn test_unstake_and_queue() {
        let env = odra_test::env();
        let investor = env.get_account(1);
        let validator = mock_validator();
        let mut meta = MetaDeployer::init(&env, validator);

        // Deposit enough to stake
        let amount = U512::from(600_000_000_000u64);
        env.set_caller(investor);
        meta.with_tokens(amount).deposit();

        // Request Unstake
        let unstake_amount = U512::from(200_000_000_000u64);
        meta.request_unstake(unstake_amount);

        // Balance should drop immediately (internal accounting)
        assert_eq!(meta.get_investor_balance(investor), amount - unstake_amount);
    }
}
