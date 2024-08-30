import React, {useEffect, useState} from 'react';
import ApiRates from "../../../API/RatesService";
import {useFetching} from "../../../hooks/useFetching";
import "./ratesTable.css"

const CurrencyRatesTable = () => {
    const [rates, setRates] = useState([]);
    const [fetchRates] = useFetching(async () => {
        const response = await ApiRates.getCurrenciesRates();
        setRates(response)
    })
    const columns = [
        { id: 'code', title: 'Code' },
        { id: 'name', title: 'Name' },
        { id: 'rate', title: 'Rate' },
        { id: 'inverseRate', title: 'Inverse Rate' }
    ];
    //after making loading effect remove void and import isLoading (and error?)
    //add comparison to previous day? mb no need in future
    useEffect(() => {
        void fetchRates();
    }, [])
    const rateEntries = Object.values(rates);
    const measurementDate = rateEntries.length > 0 ? rateEntries[0].date : 'No measurement date available';
    return (
        <div className={"section__rates"}>
            <div className={"area__rates rates__currencies"}>
                <div className={"rate__info"}>{measurementDate}</div>
                <div className={"table__rates"}>
                    {columns.map((column) => (
                    <div className={"rates__column"} key={column.id}>
                        <div className={"rates__header"} key={column.title}>{column.title}</div>
                        <div className={"rates__data"}>
                            {rateEntries.map(rate => (
                            <div className={"rates__data__item"} key={rate[column.id]}>{rate[column.id]}</div>
                            ))}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CurrencyRatesTable;