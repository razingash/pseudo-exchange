import React, {useEffect, useState} from 'react';
import AssetsService from "../API/AssetsService";
import {useFetching} from "../hooks/useFetching";
import Chart from "../components/UI/Chart/Chart";

const Assets = () => {
    const [asset, setAsset] = useState();

    const [fetchAsset] = useFetching(async () => {
        const response = await AssetsService.getAsset(2);
        setAsset(response)
    })
    /*improve*/
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

export default Assets;