import React, {useEffect, useState} from 'react';
import AssetsService from "../API/AssetsService";
import {useFetching} from "../hooks/useFetching";
import "./../styles/assets.css"
import {useNavigate} from "react-router-dom";

const Assets = () => {
    const router = useNavigate();
    const [assets, setAssets] = useState();
    const [fetchAssets] = useFetching(async () => {
        const response = await AssetsService.getAssets();
        setAssets(response);
    });

    useEffect(() => {
        fetchAssets();
    }, [])

    return (
        <div className={"section__main"}>
            <div className={"field__asset"}>
                {assets && assets.map(stock => (
                    <div className={"area__asset"} onClick={() => router(`/assets/${stock.ticker}/`)} key={stock.ticker}>
                        <div className={"asset__name"}>
                            <div>{stock.ticker}</div>
                            <div>{stock.name}</div>
                        </div>
                        <div className={"asset__data"}>
                            <div className={"asset__column"}>
                                <div className={"asset__row"}>cost</div>
                                <div className={"asset__row"}>dividents</div>
                            </div>
                            <div className={"asset__column"}>
                                <div className={"asset__row"}>{stock.cost} {stock.currency_type}</div>
                                <div className={"asset__row"}>{`${stock.dividends}%`}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Assets;