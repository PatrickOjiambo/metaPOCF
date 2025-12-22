use odra::prelude::*;

/// A module definition. Each module struct consists Vars and Mappings
/// or/and another modules.
#[odra::module]
pub struct Flipper {
    /// The module itself does not store the value,
    /// it's a proxy that writes/reads value to/from the host.
    value: Var<bool>,
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
    pub fn init(&mut self) {
        self.value.set(false);
    }
    ///CSPR Deposit
    // 
    // This function allows a user to deposit funds
    pub fn deposit(&mut self){

    }
}

#[cfg(test)]
mod tests {
    use crate::meta::Meta;
    use odra::host::{Deployer, NoArgs};


}
