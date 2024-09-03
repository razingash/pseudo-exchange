import React, {useState} from 'react';
import Chart from "../Chart/Chart";
import "./UserStats.css"
import UserTransfers from "./UserTransfers";
import {useAuth} from "../../../context/useAuth";
import UserCredits from "./UserCredits";

const UserStats = () => {
    const { uuid } = useAuth();
    const [selectedAdapter, setSelectedAdapter] = useState(null);
    const adapterItems = ["transfers", "credits", "conversions", "assets", "money journal?"];

    const handleAdapterClick = (index) => {
        setSelectedAdapter(index);
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

    return (
        <div className={"field__statistics"}>
            <div className={"block__adapter"}>
                {adapterItems.map((item, index) => (
                    <div className={`adapter__item ${selectedAdapter === index ? 'selected__item' : ''}`} onClick={() => handleAdapterClick(index)} key={item}>{item}</div>
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
        </div>
    );
};

export default UserStats;