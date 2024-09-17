import React, {useEffect, useState} from 'react';
import {useFetching} from "../hooks/useFetching";
import {useParams} from "react-router-dom";
import Chart from "../components/UI/Chart/Chart";
import "../styles/assets.css"
import {useAuth} from "../hooks/context/useAuth";
import {useInput} from "../hooks/useInput";
import {useNotifications} from "../hooks/context/useNotifications";
import AssetsService from "../API/AssetsService";
import UserAssetsService from "../API/UserRelatedServices/UserAssetsService";

const Asset = () => {
    const {uuid, isAuth} = useAuth();
    const { addNotification } = useNotifications();
    const params = useParams();
    const amount = useInput('');
    const [asset, setAsset] = useState();
    const [fetchAsset] = useFetching(async () => {
        const response = await AssetsService.getAsset(params.ticker);
        setAsset(response)
    })
    const [buyAsset, , errorCode] = useFetching(async (ticker, currencyType) => { // buy assets
        await UserAssetsService.buyAssets(uuid, ticker, 'P', currencyType, amount.value);
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        void await buyAsset(asset.ticker, asset.currency_type);
        if (errorCode === 200) {
            addNotification(`success`)
        } else {
            addNotification(`Error ${errorCode}`)
        }
    }

    useEffect(() => {
        void fetchAsset();
    }, [])
    const assetData = asset && asset.contents

    return (
        <div className={"section__main"}>
            {asset && (
                <div className={"section__asset"}>
                    <div className={"field__asset-info"}>
                        <div className={"asset-info__name"}>
                            <div>ticker</div>
                            <div>{asset.ticker}</div>
                        </div>
                        <div className={"asset-info__name"}>
                            <div>name</div>
                            <div>{asset.name}</div>
                        </div>
                        <div className={"asset-info__name"}>
                            <div>currency</div>
                            <div>{asset.currency_type}</div>
                        </div>
                        <div className={"asset-info__name"}>
                            <div>dividends</div>
                            <div>{asset.dividends}%</div>
                        </div>
                    </div>
                    {isAuth && (
                        <form onSubmit={handleSubmit} className={"new__form-2"}>
                            <input className={"form__auth__input-2"} {...amount} type={"number"} placeholder={"number of assets"}/>
                            <button className={"button__submit"}>buy</button>
                        </form>
                    )}
                </div>
            )}
            <Chart data={assetData}/>
        </div>
    );
};

export default Asset;