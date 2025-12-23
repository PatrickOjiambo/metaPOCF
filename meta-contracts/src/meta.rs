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
        let current_user_balance = self.get_investor_balance(caller);
        self.investor_balances
            .add(&caller, deposit_amount + current_user_balance);
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
    pub fn wihdraw(&mut self, amount: U512) {
        let caller = self.env().caller();
        let investor_balance = self.get_investor_balance(caller);
        assert!(investor_balance >= amount, "Insufficient balance");
        let new_inverstor_balance = investor_balance - amount;
        self.investor_balances.add(&caller, new_inverstor_balance);
        self.treasury_balance
            .add(self.treasury_balance.get_or_default() - amount);
        self.env().transfer_tokens(&caller, &amount);
    }
    pub fn dev_identify_winners(&self) -> Vec<Address> {
        if let Some(first_caller) = self.first_caller.get() {
            vec![first_caller]
        } else {
            vec![]
        }
    }

    pub fn reward_winners(&mut self) {
        let winners = self.dev_identify_winners();
        let reward_pool = self.rewards_pool.get_or_default();
        let reward_per_winner = reward_pool / U512::from(winners.len() as u64);
        for winner in winners.iter() {
            self.env().transfer_tokens(&winner, &reward_per_winner);
            self.rewards_pool.add(reward_per_winner);
        }
    }

    /// Production identify winners function
    pub fn prod_identify_winners(&self) -> Vec<Address> {
        //TODO: Implement production winner identification logic
        if let Some(first_caller) = self.first_caller.get() {
            vec![first_caller]
        } else {
            vec![]
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::meta::Meta;
    use odra::host::{Deployer, NoArgs};
}
