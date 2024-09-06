import React, {useState} from 'react';
import Chart from "../Chart/Chart";
import "./UserStats.css"
import UserTransfers from "./UserTransfers";
import UserCredits from "./UserCredits";
import NewTransferForm from "../Forms/NewTransferForm";

const UserStats = ({props}) => {
    const [selectedAdapter, setSelectedAdapter] = useState(null);
    const [activeForm, setActiveForm] = useState(null);
    const adapterItems = ["transfers", "credits", "conversions", "assets", "money journal?"];

    const handleAdapterClick = (index) => {
        setSelectedAdapter(index);
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
                return <div className="content__item">case 2</div>; // conversions
            case 3:
                return <div className="content__item">case 3</div>; // assets
            case 4:
                return <div className="content__item">case 4</div>; // money journal?
            default:
                return <div className="content__item">default</div>;
        }
    }

    const getFormForAdapter = () => {
        switch (activeForm) {
            case 0:
                return <NewTransferForm />;
            /*case 1:
                return <NewCreditForm />;
            case 2:
                return <NewConversionForm />;
            case 3:
                return <NewAssetForm />;
            case 4:
                return <NewJournalForm />;*/
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