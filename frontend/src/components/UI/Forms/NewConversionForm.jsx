import React, {useState} from 'react';
import {useAuth} from "../../../context/useAuth";
import ConversionService from "../../../API/UserRelatedServices/ConversionService";
import {useNotifications} from "../../../context/useNotifications";

const NewConversionForm = () => {
    const {uuid} = useAuth();
    const [startingCurrency, setStartingCurrency] = useState('EUR');
    const [finalCurrency, setFinalCurrency] = useState('');
    const [amount, setAmount] = useState('');
    const { addNotification } = useNotifications();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const status = await ConversionService.convertCurrency(uuid, amount, startingCurrency, finalCurrency);
        if (status === 200) {
            addNotification(`success`)
        }
    }

    const currencies = ['EUR', 'BYN', 'CNY', 'CZK', 'INR', 'JPY', 'KRW', 'PLN', 'SEK'];

    return (
        <form className={"new__form"} onSubmit={handleSubmit}>
            From
            <select onChange={e => setStartingCurrency(e.target.value)} value={startingCurrency}>
                {currencies.map(currencyCode => (
                    <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                ))}
            </select>
            To
            <select onChange={e => setFinalCurrency(e.target.value)} value={finalCurrency}>
                {currencies.map(currencyCode => (
                    <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                ))}
            </select>
            <input className={"form__auth__input"} onChange={e => {setAmount(e.target.value)}} value={amount} type={"number"} placeholder={"amount"}/>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default NewConversionForm;