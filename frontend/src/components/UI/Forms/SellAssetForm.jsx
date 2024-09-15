import React, {useEffect, useState} from 'react';
import {useAuth} from "../../../hooks/context/useAuth";
import AssetsService from "../../../API/UserRelatedServices/AssetsService";
import {useNotifications} from "../../../hooks/context/useNotifications";
import {useFetching} from "../../../hooks/useFetching";
import {useInput} from "../../../hooks/useInput";

const SellAssetForm = () => {
    const {uuid} = useAuth();
    const amount = useInput('');
    const transactionType = useInput('S');
    const currencyType = useInput('EUR');
    const [ticker, setTicker] = useState('');
    const [tickers, setTickers] = useState([]);
    const { addNotification } = useNotifications();

    const [fetchTickers] = useFetching(async () => {
        const response = await AssetsService.getUserAssets(uuid);
        return response.data.map(asset => asset.ticker)
    })
    const [fetchAssets, , errorCode] = useFetching(async () => { // buy assets
        await AssetsService.buyAssets(uuid, ticker, transactionType.value, currencyType.value, amount.value);
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        void await fetchAssets();
        if (errorCode === 200) {
            addNotification(`success`)
        } else {
            addNotification(`Error ${errorCode}`)
        }
    }

    useEffect( () => {
        const getTickers = async () => {
            const fetchedTickers = await fetchTickers();
            setTickers(fetchedTickers);
            if (fetchedTickers.length > 0 && !ticker) {
                setTicker(fetchedTickers[0]);
            }
        };
        void getTickers();
    }, [])

    const transactionTypes = { "Sell": "S", "Buy": "P" }
    const currencies = ['EUR', 'BYN', 'CNY', 'CZK', 'INR', 'JPY', 'KRW', 'PLN', 'SEK'];

    return (
        <form onSubmit={handleSubmit} className={"new__form"}>
            <select {...transactionType}>
                {Object.entries(transactionTypes).map(([transaction, type]) => (
                    <option key={transaction} value={type}>{transaction}</option>
                ))}
            </select>
            <select {...currencyType}>
                {currencies.map(currencyCode => (
                    <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                ))}
            </select>
            <select onChange={e => setTicker(e.target.value)} value={ticker}>
                {tickers.map(tickerCode => (
                    <option key={tickerCode} value={tickerCode}>{tickerCode}</option>
                ))}
            </select>
            <input className={"form__auth__input"} {...amount} type={"number"} placeholder={"number of assets"}/>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default SellAssetForm;