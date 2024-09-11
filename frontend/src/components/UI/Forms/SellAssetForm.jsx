import React, {useEffect, useState} from 'react';
import {useAuth} from "../../../context/useAuth";
import AssetsService from "../../../API/UserRelatedServices/AssetsService";
import {useNotifications} from "../../../context/useNotifications";
import {useFetching} from "../../../hooks/useFetching";

const SellAssetForm = () => {
    const {uuid} = useAuth();
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState('S');
    const [currencyType, setCurrencyType] = useState('EUR');
    const [ticker, setTicker] = useState('');
    const [tickers, setTickers] = useState([]);
    const { addNotification } = useNotifications();

    const [fetchTickers] = useFetching(async () => {
        const response = await AssetsService.getUserAssets(uuid);
        return response.map(asset => asset.ticker)
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        const status = await AssetsService.buyAssets(uuid, ticker, transactionType, currencyType, amount);
        if (status === 200) {
            addNotification(`success`)
        } else {
            addNotification(`Error ${status}`)
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
            <select onChange={e => setTransactionType(e.target.value)} value={transactionType}>
                {Object.entries(transactionTypes).map(([transaction, type]) => (
                    <option key={transaction} value={type}>{transaction}</option>
                ))}
            </select>
            <select onChange={e => setCurrencyType(e.target.value)} value={currencyType}>
                {currencies.map(currencyCode => (
                    <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                ))}
            </select>
            <select onChange={e => setTicker(e.target.value)} value={ticker}>
                {tickers.map(tickerCode => (
                    <option key={tickerCode} value={tickerCode}>{tickerCode}</option>
                ))}
            </select>
            <input className={"form__auth__input"} onChange={e => {setAmount(e.target.value)}} value={amount} type={"number"} placeholder={"number of assets"}/>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default SellAssetForm;