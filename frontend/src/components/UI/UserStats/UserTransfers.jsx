import React, {useEffect, useState} from 'react';
import {useFetching} from "../../../hooks/useFetching";
import TransferService from "../../../API/UserRelatedServices/TransferService";
import {useAuth} from "../../../context/useAuth";

const UserTransfers = () => {
    const { uuid } = useAuth();
    const [transfers, setTransers] = useState([]);
    const [fetchTransfers] = useFetching(async () => {
        const response = await TransferService.getUserTransfers(uuid);
        setTransers(response)
    })

    useEffect(() => {
        uuid && void fetchTransfers();
    }, [])

    return (
        <>
            {transfers.length > 0 ? (transfers.map(transfer => (
                <div className={"content__item"} key={transfer}>
                    <div className={"content__item__row"}>
                        <div className={""}>{transfer.sender}</div>
                        <div className={""}>{transfer.receiver}</div>
                    </div>
                    <div className={"content__item__row"}>
                        <div className={""}>{transfer.amount}</div>
                        <div className={""}>{transfer.time_stamp}</div>
                    </div>
                </div>
            ))) : (
                <div>you are too stingy, no one has received money from you yet</div>
            )}
        </>
    );
};

export default UserTransfers;