import {useAuth} from "../../../hooks/context/useAuth";
import React, {useEffect, useRef, useState} from "react";
import {useFetching} from "../../../hooks/useFetching";
import CreditService from "../../../API/UserRelatedServices/CreditService";
import PayForCreditForm from "../Forms/PayForCreditForm";
import {useObserver} from "../../../hooks/useObserver";

const UserCredits = () => {
    const { uuid } = useAuth();
    const [credits, setCredits] = useState([]);
    const [selectedCreditUuid, setSelectedCreditUuid] = useState(null);
    const lastElement = useRef();
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [fetchCredits, isCreditLoading] = useFetching(async () => {
        const response = await CreditService.getUserCredits(uuid, page);
        setCredits((prevCredits) => {
            const newCredits = response.data.filter(
                (credit) => !prevCredits.some((c) => c.uuid === credit.uuid)
            );
            return [...prevCredits, ...newCredits]
        })
        setHasNext(response.has_next);
    })

    useObserver(lastElement, fetchCredits, isCreditLoading, hasNext, page, setPage);

    const handleSelectCredit = (creditUuid) => {
        setSelectedCreditUuid(creditUuid);
    };

    useEffect(() => {
        uuid && void fetchCredits();
    }, [uuid, page])

    return (
        <>
            {credits.length > 0 ? (credits.map((credit, index) => (
                <div key={credit.uuid} ref={index === credits.length - 1 ? lastElement : null} className={`content__item ${credit.credit_status === 'opened' ? 'opened' : ''}`}>
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
                    <div className={"content__item__row content__item__payment"} onClick={() => handleSelectCredit(credit.uuid)}>
                        <div className={""}>To Pay</div>
                        <div className={""}>{credit.to_pay}</div>
                    </div>
                    {selectedCreditUuid === credit.uuid && (
                        <PayForCreditForm creditUuid={selectedCreditUuid} onSuccess={fetchCredits} />
                    )}
                </div>
            ))) : (
                <div>your credit history is empty</div>
            )}
        </>
    );
};

export default UserCredits;