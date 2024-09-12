import React, {useEffect, useState} from 'react';
import Chart from "../Chart/Chart";
import "./UserStats.css"
import UserTransfers from "./UserTransfers";
import UserCredits from "./UserCredits";
import NewTransferForm from "../Forms/NewTransferForm";
import NewCreditForm from "../Forms/NewCreditForm";
import NewConversionForm from "../Forms/NewConversionForm";
import UserConversions from "./UserConversions";
import SellAssetForm from "../Forms/SellAssetForm";
import UserAssets from "./UserAssets";
import {useNavigate, useParams} from "react-router-dom";

const UserStats = ({props}) => {
    const { adapter } = useParams();
    const navigate = useNavigate();
    const [selectedAdapter, setSelectedAdapter] = useState(null);
    const [activeForm, setActiveForm] = useState(null);
    const adapterItems = ["transfers", "credits", "conversions", "assets"];

    useEffect(() => {
        const adapterIndex = adapterItems.indexOf(adapter);
        if (adapterIndex !== -1) {
            setSelectedAdapter(adapterIndex);
        } else {
            setSelectedAdapter(null);
        }
    }, [adapter]);

    const handleAdapterClick = (index) => {
        setSelectedAdapter(index);
        navigate(`/account/${adapterItems[index]}/`);
    }

    const handleNewFormClick = (index) => {
        setActiveForm(index);
        props.spawnNewForm();
    }

    const getContent = () => {
        switch (selectedAdapter) {
            case 0:
                return <UserTransfers/>; // transfers
            case 1:
                return <UserCredits/>; // credits
            case 2:
                return <UserConversions/>; // conversions
            case 3:
                return <UserAssets/>; // assets
            default:
                return <div className="content__item">default</div>;
        }
    }

    const getFormForAdapter = () => {
        switch (activeForm) {
            case 0:
                return <NewTransferForm />;
            case 1:
                return <NewCreditForm />;
            case 2:
                return <NewConversionForm />;
            case 3:
                return <SellAssetForm />;
            default:
                return null;
        }
    }

    return (
        <div className={"field__statistics"}>
            <div className={"block__adapter"}>
                {adapterItems.map((item, index) => (
                    <div className={`adapter__item ${selectedAdapter === index ? 'selected__item' : ''}`} onClick={() => handleAdapterClick(index)} key={item}>
                        <div>{item}</div>
                        <div className={`adapter__item__new ${selectedAdapter === index ? 'selected__adapter' : ''}`} onClick={() => handleNewFormClick(index)}>+</div>
                    </div>
                ))}
            </div>
            <div className={"block__statistics"}>
                <div className={"statistics__params"}></div>
                <div className={"statistics__field"}>
                    <Chart/>
                </div>
            </div>
            <div className={"block__content"}>
                {getContent()}
            </div>
            {props.isNewSelectedFormSpawned && props.activeFormType === 'stats' && (
                <div className={"new__form__field"}>
                    <div className={"new__form__field__exit"}><div onClick={props.removeNewSelectedForm} className={"exit-mark"}>&#x274c;</div></div>
                    {getFormForAdapter()}
                </div>
            )}
        </div>
    );
};

export default UserStats;