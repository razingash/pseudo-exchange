import React, {useEffect, useState} from 'react';
import "./UserWallets.css";
import {useFetching} from "../../../hooks/useFetching";
import {useApiInterceptors} from "../../../hooks/useApiInterceptors";
import AccountService from "../../../API/UserRelatedServices/AccountService";

//figure out what to do with uuid

const UserWallets = () => {
    useApiInterceptors();
    const [mainWallet, setMainWallet] = useState();
    const [wallets, setWallets] = useState([]);
    const [fetchMainWallet] = useFetching(async () => {
        const response = await AccountService.getAccountInfo('95a0fa45758847898703224e798e324b')
        setMainWallet(response)
    })
    const [fetchWallets] = useFetching(async () => {
        const response = await AccountService.getAdditionalWallets('95a0fa45758847898703224e798e324b')
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