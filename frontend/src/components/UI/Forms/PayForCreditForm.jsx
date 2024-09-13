import React from 'react';
import CreditService from "../../../API/UserRelatedServices/CreditService";
import {useAuth} from "../../../hooks/context/useAuth";
import {useInput} from "../../../hooks/useInput";
import {useFetching} from "../../../hooks/useFetching";

const PayForCreditForm = ({ creditUuid, onSuccess }) => {
    const {uuid} = useAuth();
    const amount = useInput(null);
    const [fetchPayForCredit, isPaymentLoading, responseStatus] = useFetching(async () => {
        await CreditService.payForCredit(uuid, creditUuid, amount.value);
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetchPayForCredit(uuid, creditUuid, amount.value);
        if (responseStatus === 200) {
            if (onSuccess) {
                onSuccess();
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className={"new__form"}>
            <input type="hidden" value={creditUuid} />
            <input className={"form__auth__input"} {...amount} type={"number"} placeholder={"pay off the loan..."}/>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default PayForCreditForm;