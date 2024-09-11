import React, {useState} from 'react';
import CreditService from "../../../API/UserRelatedServices/CreditService";
import {useAuth} from "../../../context/useAuth";

const PayForCreditForm = ({ creditUuid, onSuccess }) => {
    const {uuid} = useAuth();
    const [amount, setAmount] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const status = await CreditService.payForCredit(uuid, creditUuid, amount);
        if (status === 200) {
            if (onSuccess) {
                onSuccess();
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className={"new__form"}>
            <input type="hidden" value={creditUuid} />
            <input className={"form__auth__input"} onChange={e => {setAmount(e.target.value)}} value={amount} type={"number"} placeholder={"pay off the loan..."}/>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default PayForCreditForm;