import {useAuth} from "../../../context/useAuth";
import React, {useEffect, useState} from "react";
import {useFetching} from "../../../hooks/useFetching";
import CreditService from "../../../API/UserRelatedServices/CreditService";

const UserCredits = () => {
    const { uuid } = useAuth();
    const [credits, setCredits] = useState([]);
    const [fetchCredits] = useFetching(async () => {
        const response = await CreditService.getUserCredits(uuid);
        console.log(response)
        setCredits(response)
    })

    useEffect(() => {
        uuid && void fetchCredits();
    }, [])

    return (
        <>
            {credits.length > 0 ? (credits.map(credit => (
                <div className={"content__item"} key={credit}>
                    <div className={"content__item__row"}>
                        <div className={""}>{credit.sender}</div>
                        <div className={""}>{credit.receiver}</div>
                    </div>
                    <div className={"content__item__row"}>
                        <div className={""}>{credit.amount}</div>
                        <div className={""}>{credit.time_stamp}</div>
                    </div>
                </div>
            ))) : (
                <div>your credit history is empty</div>
            )}
        </>
    );
};

export default UserCredits;