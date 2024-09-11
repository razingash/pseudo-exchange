import React, {useEffect, useState} from 'react';
import "./UserWallets.css";
import {useFetching} from "../../../hooks/useFetching";
import {useApiInterceptors} from "../../../hooks/useApiInterceptors";
import AccountService from "../../../API/UserRelatedServices/AccountService";
import NewWalletForm from "../Forms/NewWalletForm";
import {useAuth} from "../../../context/useAuth";


const UserWallets = ({props}) => {
    useApiInterceptors();
    const { uuid } = useAuth();
    const [mainWallet, setMainWallet] = useState();
    const [wallets, setWallets] = useState([]);
    const [fetchMainWallet] = useFetching(async () => {
        const response = await AccountService.getAccountInfo(uuid)
        setMainWallet(response)
    })
    const [fetchWallets] = useFetching(async () => {
        const response = await AccountService.getAdditionalWallets(uuid)
        setWallets(response)
    })

    useEffect(() => {
        if (uuid) {
            void fetchMainWallet();
            void fetchWallets();
        } else {
            console.log('UUID is not defined');
        }
    }, [uuid])

    return (
        <div className={"field__wallets"}>
            <div className={"new__form__button"} onClick={props.spawnNewForm}>+</div>
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
            {props.isNewSelectedFormSpawned && props.activeFormType === 'wallet' && (
                <div className={"new__wallet__field"}>
                    <div className={"new__wallet__field__exit"}><div onClick={props.removeNewSelectedForm} className={"exit-mark"}>&#x274c;</div></div>
                    <div className={"new__wallet__item"}>open new wallet</div>
                    <NewWalletForm />
                </div>
            )}
        </div>
    );
};

export default UserWallets;