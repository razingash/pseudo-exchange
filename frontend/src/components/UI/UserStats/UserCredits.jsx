import {useAuth} from "../../../context/useAuth";
import React, {useEffect, useState} from "react";
import {useFetching} from "../../../hooks/useFetching";
import CreditService from "../../../API/UserRelatedServices/CreditService";

const UserCredits = () => {
    const { uuid } = useAuth();
    const [credits, setCredits] = useState([]);
    const [fetchCredits] = useFetching(async () => {
        const response = await CreditService.getUserCredits(uuid);
        setCredits(response)
    })

    useEffect(() => {
        uuid && void fetchCredits();
    }, [])

    return (
        <>
            {credits.length > 0 ? (credits.map(credit => (
                <div className={`content__item ${credit.credit_status === 'opened' ? 'opened' : ''}`} key={credit}>
                    <div className={"content__item__row"}>
                        <div className={""}>Type</div>
                        <div className={""}>{credit.credit_type}</div>
                    </div>
                    <div className={"content__item__row"}>
                        <div className={""}>Amount</div>
                        <div className={""}>{credit.amount}</div>
                    </div>
                    <div className={"content__item__row"}>
                        <div className={""}>Daily Debiting</div>
                        <div className={""}>{credit.daily_debiting}</div>
                    </div>
                    <div className={"content__item__row"}>
                        <div className={""}>Daily Growth</div>
                        <div className={""}>{credit.daily_growth}</div>
                    </div>
                    <div className={"content__item__row"}>
                        <div className={""}>To Pay</div>
                        <div className={""}>{credit.to_pay}</div>
                    </div>
                </div>
            ))) : (
                <div>your credit history is empty</div>
            )}
        </>
    );
};

export default UserCredits;