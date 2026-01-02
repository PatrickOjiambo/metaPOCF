use odra::casper_types::{PublicKey, U512};
use odra::prelude::*;

#[odra::module]
pub struct Meta {
    treasury_balance: Var<U512>,
    staked_amount: Var<U512>,
    pending_stake_pool: Var<U512>,
    total_unstaked_amount: Var<U512>,
    investor_balances: Mapping<Address, U512>,
    validator: Var<PublicKey>,
    rewards_pool: Var<U512>,
    unstake_queue: List<UnstakeRequest>,
    harvested_prize_pool: Var<U512>,
    total_principal: Var<U512>,
}
#[odra::event]
pub struct RewardsHarvestedEvent {
    pub amount: U512,
}
#[odra::event]
pub struct DepositMadeEvent {
    pub user: Address,
    pub amount: U512,
}
#[odra::event]
pub struct UnstakeRequestedEvent {
    pub user: Address,
    pub amount: U512,
}

#[odra::odra_type]
pub struct UnstakeRequest {
    pub user: Address,
    pub amount: U512,
}
#[odra::module]
impl Meta {
    pub fn init(&mut self, validator: PublicKey) {
        self.validator.set(validator);
        self.treasury_balance.set(U512::zero());
        self.rewards_pool.set(U512::zero());
        self.staked_amount.set(U512::zero());
        self.pending_stake_pool.set(U512::zero());
        self.total_unstaked_amount.set(U512::zero());
        self.total_principal.set(U512::zero());
        self.harvested_prize_pool.set(U512::zero());
    }
    #[odra(payable)]
    pub fn deposit(&mut self) {
        let caller = self.env().caller();
        const ONE_CSPR_IN_MOTES: u64 = 1_000_000_000;

        let deposit_amount = self.env().attached_value();
        self.treasury_balance.add(deposit_amount);
        self.total_principal.add(deposit_amount);
        self.investor_balances.add(&caller, deposit_amount);
        let current_pending = self.pending_stake_pool.get_or_default();
        let new_pending = current_pending + deposit_amount;

        let min_stake = U512::from(50 * ONE_CSPR_IN_MOTES);
        if new_pending >= min_stake {
            self.stake(new_pending);

            self.staked_amount.add(new_pending);
            self.treasury_balance.subtract(new_pending);

            self.pending_stake_pool.set(U512::zero());
        } else {
            self.pending_stake_pool.set(new_pending);
        }
        self.env().emit_event(DepositMadeEvent {
            user: caller,
            amount: deposit_amount,
        });
        //TODO: Mint mCSPR tokens to the user representing their stake
    }

    pub fn request_unstake(&mut self, amount: U512) {
        let caller = self.env().caller();
        let investor_balance = self.get_investor_balance(caller);
        assert!(investor_balance >= amount, "Insufficient balance");
        self.unstake(amount);
        self.staked_amount.subtract(amount);
        self.total_unstaked_amount.add(amount);
        self.investor_balances.subtract(&caller, amount);
        let request = UnstakeRequest {
            user: caller,
            amount,
        };
        self.unstake_queue.push(request);
    }

    pub fn unstake(&mut self, amount: U512) {
        self.env().undelegate(self.validator.get().unwrap(), amount);
    }
    pub fn stake(&mut self, amount: U512) {
        self.env().delegate(self.validator.get().unwrap(), amount);
    }
    pub fn get_investor_balance(&self, investor: Address) -> U512 {
        self.investor_balances.get_or_default(&investor)
    }
    //TODO: Later find a way to remove processed requests from the queue
    #[odra(payable)]
    pub fn withdraw(&mut self) {

        let mut current_liquid_cspr = self.env().self_balance();

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
                    processed_count += 1;
                } else {
                    break;
                }
            }
        }

        //TODO:  Cleanup: Remove the processed items from the list
    }
    pub fn harvest_rewards(&mut self) {
        let total_liabilities = self.total_principal.get_or_default()
            + self.total_unstaked_amount.get_or_default()
            + self.pending_stake_pool.get_or_default();

        let total_assets = self.env().self_balance() + self.staked_amount.get_or_default();

        if total_assets > total_liabilities {
            let surplus = total_assets - total_liabilities;

            self.harvested_prize_pool.set(surplus);
        }
    }
    pub fn get_staked_amount(&self) -> U512 {
        self.staked_amount.get_or_default()
    }
    pub fn get_treasury_balance(&self) -> U512 {
        self.treasury_balance.get_or_default()
    }
    pub fn get_pending_stake_pool(&self) -> U512 {
        self.pending_stake_pool.get_or_default()
    }
    pub fn get_unstaked_amount(&self) -> U512 {
        self.total_unstaked_amount.get_or_default()
    }
    pub fn get_harvested_prize_pool(&self) -> U512 {
        self.harvested_prize_pool.get_or_default()
    }
    pub fn get_unstaked_queue_length(&self) -> u32 {
        self.unstake_queue.len()
    }
}

#[cfg(test)]
mod tests {
    use super::{Meta, MetaInitArgs};
    use crate::meta::MetaHostRef;
    use odra::casper_types::{PublicKey, SecretKey, U512};
    use odra::host::{Deployer, HostEnv, HostRef};
    use odra::prelude::*;
    const ONE_HOUR_IN_MILLISECONDS: u64 = 3_600_000;
    const ONE_CSPR_IN_MOTES: u64 = 1_000_000_000;
    // Helper to create a dummy validator public key
    fn mock_validator() -> PublicKey {
        let secret_key = SecretKey::ed25519_from_bytes([1u8; 32]).unwrap();
        PublicKey::from(&secret_key)
    }

    #[test]
    fn init_test() {
        let test_env = odra_test::env();
        let init_args = MetaInitArgs {
            validator: mock_validator(),
        };
        let meta_contract = Meta::deploy(&test_env, init_args);
        assert_eq!(meta_contract.get_staked_amount(), U512::zero());
        assert_eq!(meta_contract.get_treasury_balance(), U512::zero());
        assert_eq!(meta_contract.get_pending_stake_pool(), U512::zero());
    }
    #[test]
    fn deposit_below_threshold() {
        let test_env = odra_test::env();
        let init_args = MetaInitArgs {
            validator: mock_validator(),
        };
        let mut meta_contract = Meta::deploy(&test_env, init_args);

        // Deposit 300 CSPR (300,000,000,000 Motes)
        let deposit_amount = U512::from(30 * ONE_CSPR_IN_MOTES);
        let alice = test_env.get_account(0);
        test_env.set_caller(alice.address());
        meta_contract.with_tokens(deposit_amount).deposit();
        assert_eq!(meta_contract.get_treasury_balance(), deposit_amount);
        assert_eq!(meta_contract.get_pending_stake_pool(), deposit_amount);
        assert_eq!(meta_contract.get_staked_amount(), U512::zero());
    }
    #[test]
    fn deposit_above_threshold() {
        let test_env = odra_test::env();
        let init_args = MetaInitArgs {
            validator: mock_validator(),
        };
        let mut meta_contract = Meta::deploy(&test_env, init_args);

        // Deposit 600 CSPR (600,000,000,000 Motes)
        let deposit_amount = U512::from(60 * ONE_CSPR_IN_MOTES);
        let bob = test_env.get_account(1);
        test_env.set_caller(bob.address());
        meta_contract.with_tokens(deposit_amount).deposit();
        assert_eq!(meta_contract.get_treasury_balance(), U512::zero());
        assert_eq!(meta_contract.get_pending_stake_pool(), U512::zero());
        assert_eq!(meta_contract.get_staked_amount(), deposit_amount);
    }

    #[test]
    fn multiple_deposits_meeting_threshold() {
        let test_env = odra_test::env();
        let init_args = MetaInitArgs {
            validator: mock_validator(),
        };
        let mut meta_contract = Meta::deploy(&test_env, init_args);
        // First deposit: 200 CSPR (200,000,000,000 Motes)
        let deposit_amount1 = U512::from(20 * ONE_CSPR_IN_MOTES);
        let alice = test_env.get_account(0);
        test_env.set_caller(alice.address());
        meta_contract.with_tokens(deposit_amount1).deposit();
        assert_eq!(meta_contract.get_treasury_balance(), deposit_amount1);
        assert_eq!(meta_contract.get_pending_stake_pool(), deposit_amount1);
        assert_eq!(meta_contract.get_staked_amount(), U512::zero());
        // Second deposit: 350 CSPR (350,000,000,000 Motes)
        let deposit_amount2 = U512::from(35 * ONE_CSPR_IN_MOTES);
        let bob = test_env.get_account(1);
        test_env.set_caller(bob.address());
        meta_contract.with_tokens(deposit_amount2).deposit();
        let total_deposit = deposit_amount1 + deposit_amount2;
        assert_eq!(meta_contract.get_treasury_balance(), U512::zero());
        assert_eq!(meta_contract.get_pending_stake_pool(), U512::zero());
        assert_eq!(meta_contract.get_staked_amount(), total_deposit);
    }
    #[test]
    fn unstake_request() {
        let test_env = odra_test::env();
        let init_args = MetaInitArgs {
            validator: mock_validator(),
        };
        let mut meta_contract = Meta::deploy(&test_env, init_args);

        // Deposit 600 CSPR (600,000,000,000 Motes)
        let deposit_amount = U512::from(60 * ONE_CSPR_IN_MOTES);
        let bob = test_env.get_account(1);
        test_env.set_caller(bob.address());
        meta_contract.with_tokens(deposit_amount).deposit();

        // Request unstake of 200 CSPR (200,000,000,000 Motes)
        let unstake_amount = U512::from(20 * ONE_CSPR_IN_MOTES);
        meta_contract.request_unstake(unstake_amount);

        assert_eq!(
            meta_contract.get_staked_amount(),
            deposit_amount - unstake_amount
        );
        assert_eq!(meta_contract.get_unstaked_amount(), unstake_amount);
        assert_eq!(
            meta_contract.get_investor_balance(bob.address()),
            deposit_amount - unstake_amount
        );
        assert_eq!(meta_contract.get_unstaked_queue_length(), 1);
    }

}
