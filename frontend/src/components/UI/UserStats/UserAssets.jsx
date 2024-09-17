import React, {useEffect, useRef, useState} from 'react';
import {useAuth} from "../../../hooks/context/useAuth";
import {useFetching} from "../../../hooks/useFetching";
import UserAssetsService from "../../../API/UserRelatedServices/UserAssetsService";
import {useObserver} from "../../../hooks/useObserver";

const UserAssets = () => {
    const { uuid } = useAuth();
    const [assets, setAssets] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const lastElement = useRef();
    const [fetchAssets, isAssetsLoading] = useFetching(async () => {
        const response = await UserAssetsService.getUserAssets(uuid, page);
        setAssets((prevAssets) => {
            const newAssets = response.data.filter(
                (asset) => !prevAssets.some((a) => a.ticker === asset.ticker)
            );
            return [...prevAssets, ...newAssets]
        })
        setHasNext(response.has_next);
    })

    useObserver(lastElement, fetchAssets, isAssetsLoading, hasNext, page, setPage);

    useEffect(() => {
        uuid && void fetchAssets();
    }, [uuid, page])

    return (
        <>
            {assets.length > 0 ? (assets.map((asset, index) => (
                <div ref={index === assets.length - 1 ? lastElement : null} className={"content__item"} key={asset.ticker}>
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