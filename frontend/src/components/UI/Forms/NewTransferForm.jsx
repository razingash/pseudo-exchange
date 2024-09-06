import React, {useState} from 'react';
import {useAuth} from "../../../context/useAuth";
import TransferService from "../../../API/UserRelatedServices/TransferService";

const NewTransferForm = () => {
    const {uuid} = useAuth();
    const [receiver, setReceiver] = useState('');
    const [amount, setAmount] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        await TransferService.createNewTransfers(uuid, amount, receiver);
    }

    return (
        <form onSubmit={handleSubmit} className={"new__form"}>
            <input className={"form__auth__input"} onChange={e => {setReceiver(e.target.value)}} value={receiver} type={"number"} placeholder={"acc number"}/>
            <input className={"form__auth__input"} onChange={e => {setAmount(e.target.value)}} value={amount} type={"number"} placeholder={"amount"}/>
            <button className={"button__submit"}>submit</button>
        </form>
    );
};

export default NewTransferForm;