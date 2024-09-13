import React from 'react';
import {useAuth} from "../../../hooks/context/useAuth";
import CreditService from "../../../API/UserRelatedServices/CreditService";
import {useInput} from "../../../hooks/useInput";
import {useFetching} from "../../../hooks/useFetching";

const NewCreditForm = () => {
    const {uuid} = useAuth();
    const creditType = useInput('1');
    const [fetchNewCredit] = useFetching(async () => {
        await CreditService.createNewCredit(uuid, creditType.value);
    })
    const handleSubmit = async (e) => {
        e.preventDefault();
        void await fetchNewCredit();
    }

    const creditTypes = { "Consumer Loan": "1", "Bail Bond": "2" }

    return (
        <form onSubmit={handleSubmit} className={"new__form"}>
            <select {...creditType}>
                {Object.entries(creditTypes).map(([credit, type]) => (
                    <option key={credit} value={type}>{credit}</option>
                ))}
            </select>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default NewCreditForm;