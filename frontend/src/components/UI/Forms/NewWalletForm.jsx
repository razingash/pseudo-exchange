import React from 'react';
import AccountService from "../../../API/UserRelatedServices/AccountService";
import {useAuth} from "../../../hooks/context/useAuth";
import {useNotifications} from "../../../hooks/context/useNotifications";
import {useInput} from "../../../hooks/useInput";
import {useFetching} from "../../../hooks/useFetching";


const NewWalletForm = ({ onSuccess  }) => {
    const {uuid} = useAuth();
    const currency = useInput('BYN');
    const { addNotification } = useNotifications();
    const [fetchNewWallet, isNewWalletLoading, errorCode] = useFetching(async () => {
        await AccountService.createNewWallet(uuid, currency.value);
    })
    const handleSubmit = async (e) => {
        e.preventDefault();
        uuid && await fetchNewWallet();
        if (errorCode === 200) {
            addNotification(`Wallet with ${currency.value} currency successfully created`)
            if (onSuccess) {
                onSuccess();
            }
        } else if (errorCode === 400) {
            addNotification(`bad request: ${errorCode}`);
        }
    }

    const currencies = ['BYN', 'CNY', 'CZK', 'INR', 'JPY', 'KRW', 'PLN', 'SEK'];

    return (
        <form className={"new__form"} onSubmit={handleSubmit}>
            <select {...currency}>
                {currencies.map(currencyCode => (
                    <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                ))}
            </select>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default NewWalletForm;