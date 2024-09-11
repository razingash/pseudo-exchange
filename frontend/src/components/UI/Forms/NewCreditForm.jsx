import React, {useState} from 'react';
import {useAuth} from "../../../context/useAuth";
import CreditService from "../../../API/UserRelatedServices/CreditService";

const NewCreditForm = ({ onSuccess }) => {
    const {uuid} = useAuth();
    const [creditType, setCreditType] = useState('1');
    const handleSubmit = async (e) => {
        e.preventDefault();
        await CreditService.createNewCredit(uuid, creditType);
    }

    const creditTypes = { "Consumer Loan": "1", "Bail Bond": "2" }

    return (
        <form onSubmit={handleSubmit} className={"new__form"}>
            <select onChange={e => setCreditType(e.target.value)} value={creditType}>
                {Object.entries(creditTypes).map(([credit, type]) => (
                    <option key={credit} value={type}>{credit}</option>
                ))}
            </select>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default NewCreditForm;