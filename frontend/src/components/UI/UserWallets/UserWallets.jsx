import React, {useEffect, useState} from 'react';
import "./UserWallets.css";
import {useFetching} from "../../../hooks/useFetching";
import AccountService from "../../../API/AccountService";
import {useApiInterceptors} from "../../../hooks/useApiInterceptors";

const UserWallets = () => {
    useApiInterceptors();
    const [mainWallet, setMainWallet] = useState();
    const [wallets, setWallets] = useState([]);
    const [fetchMainWallet] = useFetching(async () => {
        const response = await AccountService.getAccountInfo('ee5aec0d30614ea4ad5c98e49178694b')
        setMainWallet(response)
    })
    const [fetchWallets] = useFetching(async () => {
        const response = await AccountService.getAdditionalWallets('ee5aec0d30614ea4ad5c98e49178694b')
        setWallets(response)
    })
    const currencies = [
        {'BYN': 'Belarusian ruble'},
        {'CNY': 'Chinese Yuan'},
        {'CZK': 'Czech koruna'},
        {'EUR': 'euro'},
        {'INR': 'Indian Rupee'},
        {'JPY': 'Japanese yen'},
        {'KRW': 'South Korean won'},
        {'PLN': 'Polish zloty'},
        {'SEK': 'Swedish krona'},
    ]

    useEffect(() => {
        void fetchMainWallet();
        void fetchWallets();
    }, [])

    return (
        <div className={"field__wallets"}>
            <div className={"wallet__item"}>
                <div className={"wallet__currency"}>EUR</div>
                <div className={"wallet__balance"}>{mainWallet ? mainWallet.balance : 'Loading...'}</div>
            </div>
            {wallets.map(wallet => (
                <div className={"wallet__item"} key={wallet.currency}>
                    <div className={"wallet__currency"}>{wallet.currency}</div>
                    <div className={"wallet__balance"}>{wallet.balance}</div>
                </div>
            ))}
        </div>
    );
};

export default UserWallets;