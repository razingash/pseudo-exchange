import React from 'react';
import {useAuth} from "../../../hooks/context/useAuth";
import ConversionService from "../../../API/UserRelatedServices/ConversionService";
import {useNotifications} from "../../../hooks/context/useNotifications";
import {useInput} from "../../../hooks/useInput";
import {useFetching} from "../../../hooks/useFetching";

const NewConversionForm = () => {
    const {uuid} = useAuth();
    const startingCurrency = useInput('EUR');
    const finalCurrency= useInput('');
    const amount = useInput('');
    const { addNotification } = useNotifications();
    const [fetchConvertedCurrency, , errorCode] = useFetching(async () => {
        await ConversionService.convertCurrency(uuid, amount.value, startingCurrency.value, finalCurrency.value);
    })
    const handleSubmit = async (e) => {
        e.preventDefault();
        void await fetchConvertedCurrency();
        if (errorCode === 200) {
            addNotification(`success`)
        }
    }

    const currencies = ['EUR', 'BYN', 'CNY', 'CZK', 'INR', 'JPY', 'KRW', 'PLN', 'SEK'];

    return (
        <form className={"new__form"} onSubmit={handleSubmit}>
            From
            <select {...startingCurrency}>
                {currencies.map(currencyCode => (
                    <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                ))}
            </select>
            To
            <select {...finalCurrency}>
                {currencies.map(currencyCode => (
                    <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                ))}
            </select>
            <input className={"form__auth__input"} {...amount} type={"number"} placeholder={"amount"}/>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default NewConversionForm;