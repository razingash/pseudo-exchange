import React, {useEffect, useState} from 'react';
import {useAuth} from "../../../context/useAuth";
import {useFetching} from "../../../hooks/useFetching";
import AssetsService from "../../../API/UserRelatedServices/AssetsService";

const UserAssets = () => {
    const { uuid } = useAuth();
    const [assets, setAssets] = useState([]);
    const [fetchAssets] = useFetching(async () => {
        const response = await AssetsService.getUserAssets(uuid);
        setAssets(response)
    })

    useEffect(() => {
        void fetchAssets();
    }, [])

    return (
        <>
            {assets.length > 0 ? (assets.map(asset => (
                <div className={"content__item"} key={asset.ticker}>
                    <div className={"content__item__row"}>
                        <div>asset</div>
                        <div>{asset.ticker}</div>
                    </div>
                    <div className={"content__item__row"}>
                        <div>amount</div>
                        <div>{asset.amount}</div>
                    </div>
                </div>
            ))) : (
                <div>you don't have any assets, how do you want to make money?</div>
            )}
        </>
    );
};

export default UserAssets;