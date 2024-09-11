import React, {useState} from 'react';
import AccountService from "../../../API/UserRelatedServices/AccountService";
import {useAuth} from "../../../context/useAuth";
import {useNotifications} from "../../../context/useNotifications";


const NewWalletForm = ({ onSuccess  }) => {
    const {uuid} = useAuth();
    const [currency, setCurrency] = useState('BYN');
    const { addNotification } = useNotifications();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const status = uuid && await AccountService.createNewWallet(uuid, currency);
        if (status === 200) {
            addNotification(`Wallet with ${currency} currency successfully created`)
            if (onSuccess) {
                onSuccess();
            }
        } else if (status === 400) {
            addNotification(`bad request: ${status}`);
        }
    }

    const currencies = ['BYN', 'CNY', 'CZK', 'INR', 'JPY', 'KRW', 'PLN', 'SEK'];

    return (
        <form className={"new__form"} onSubmit={handleSubmit}>
            <select onChange={e => setCurrency(e.target.value)} value={currency}>
                {currencies.map(currencyCode => (
                    <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                ))}
            </select>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default NewWalletForm;