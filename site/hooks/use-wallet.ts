import { useContext, useEffect, useState } from 'react';
import { PublicKey } from 'casper-js-sdk';
import { useClickRef } from '@make-software/csprclick-ui';
import {
    AccountType,
    TransactionStatus,
} from '@make-software/csprclick-core-types';
import { ActiveAccountContext } from '@/app/layout';
import { Transaction } from '@/types';
interface Wallet {
    userAccount: AccountType | null;
    connectWallet: () => void;

}

const useManagePlay = (): Wallet => {
    const clickRef = useClickRef();
    const activeAccountContext = useContext(ActiveAccountContext);
    const [userAccount, setUserAccount] =
        useState<AccountType | null>(null);
    const [executedTransaction, setExecutedTransaction] = useState<Transaction | null>(
        null
    );
    useEffect(() => {
        if (activeAccountContext && clickRef) {
            clickRef
                .getActiveAccountAsync({ withBalance: true })
                .then(userAccount => {
                    setUserAccount(userAccount);
                });
        } else {
            setUserAccount(null);
        }
    }, [activeAccountContext]);
    const connectWallet = () => {
        clickRef?.signIn();
    };

    return {
        connectWallet,
        userAccount
    };
};

export default useManagePlay;
