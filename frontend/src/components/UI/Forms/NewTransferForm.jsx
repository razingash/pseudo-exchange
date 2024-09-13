import React from 'react';
import {useAuth} from "../../../hooks/context/useAuth";
import TransferService from "../../../API/UserRelatedServices/TransferService";
import {useInput} from "../../../hooks/useInput";
import {useFetching} from "../../../hooks/useFetching";

const NewTransferForm = () => {
    const {uuid} = useAuth();
    const receiver = useInput('');
    const amount = useInput('');
    const [fetchNewTransfer] = useFetching(async () => {
        await TransferService.createNewTransfer(uuid, amount, receiver);
    })
    const handleSubmit = async (e) => {
        e.preventDefault();
        void await fetchNewTransfer();
    }

    return (
        <form onSubmit={handleSubmit} className={"new__form"}>
            <input className={"form__auth__input"} {...receiver} type={"number"} placeholder={"acc number"}/>
            <input className={"form__auth__input"} {...amount} type={"number"} placeholder={"amount"}/>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default NewTransferForm;