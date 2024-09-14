import React, {useEffect, useRef, useState} from 'react';
import {useFetching} from "../../../hooks/useFetching";
import TransferService from "../../../API/UserRelatedServices/TransferService";
import {useAuth} from "../../../hooks/context/useAuth";
import {useObserver} from "../../../hooks/useObserver";

const UserTransfers = () => {
    const { uuid } = useAuth();
    const [transfers, setTransfers] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const lastElement = useRef();
    const [fetchTransfers, isTransfersLoading] = useFetching(async () => {
        const response = await TransferService.getUserTransfers(uuid, page);
         setTransfers((prevTransfers) => {
            const newTransfers = response.data.filter(
                (transfer) => !prevTransfers.some((t) => t.time_stamp === transfer.time_stamp)
            );
            return [...prevTransfers, ...newTransfers];
        });
        setHasNext(response.has_next);
    })

    useObserver(lastElement, fetchTransfers, isTransfersLoading, hasNext, page, setPage);

    useEffect(() => {
        uuid && void fetchTransfers();
    }, [uuid, page]);

    return (
        <>
            {transfers.length > 0 ? (transfers.map((transfer, index) => (
                <div className={"content__item"} key={transfer.time_stamp} ref={index === transfers.length - 1 ? lastElement : null}>
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