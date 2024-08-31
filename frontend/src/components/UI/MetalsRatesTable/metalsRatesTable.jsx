import React, {useEffect, useState} from 'react';
import {useFetching} from "../../../hooks/useFetching";
import ApiRates from "../../../API/RatesService";

const MetalsRatesTable = () => {
    const [metals, setMetals] = useState([]);
    const [fetchMetals] = useFetching(async () => {
        const response = await ApiRates.getPreciousMetals();
        setMetals(response)
    })
    const columns = [
        {id: "code", title: "Code"},
        {id: "name", title: "Name"},
        {id: "cost", title: "Cost"}
    ]
    useEffect(() => {
        void fetchMetals();
    }, [])

    const measurementDate = metals && metals.length > 0 ?
        new Date(metals.at(0).contents.at(-1).timestamp * 1000).toLocaleString(): "Loading";
    const metalsLatestPrices = metals.map(e => (
        {"code": e.code, "name": e.name, "cost": e.contents.at(-1).cost}
    ))
    // get all metals - func for chart
    /*const metalsList = metals.map(e => ({
        [e.code]: e.contents.map(({ timestamp, cost }) => ({
            [new Date(timestamp * 1000).toLocaleDateString()]: cost
        }))
    }));*/
    return (
        <div className={"section__rates"}>
            <div className={"area__rates"}>
                <div className={"rate__info"}>{measurementDate}</div>
                <div className={"table__rates"}>
                    {columns.map((column) => (
                    <div className={"rates__column"} key={column.id}>
                        <div className={"rates__header"} key={column.title}>{column.title}</div>
                        <div className={"rates__data"}>
                            {metalsLatestPrices.map(rate => (
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

export default MetalsRatesTable;