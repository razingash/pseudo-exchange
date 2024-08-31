import React, {useEffect, useState} from 'react';
import AssetsService from "../API/AssetsService";
import {useFetching} from "../hooks/useFetching";
import Chart from "../components/UI/Chart/Chart";
import {useParams} from "react-router-dom";

const Asset = () => {
    const params = useParams();
    const [asset, setAsset] = useState();
    const [fetchAsset] = useFetching(async () => {
        const response = await AssetsService.getAsset(params.ticker);
        setAsset(response)
    })
    useEffect(() => {
        fetchAsset();
    }, [])
    const assetData = asset && asset.contents

    return (
        <div className={"section__main"}>
            <Chart data={assetData}></Chart>
        </div>
    );
};

export default Asset;