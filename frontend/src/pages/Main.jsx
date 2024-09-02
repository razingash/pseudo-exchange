import React from 'react';
import CurrencyRatesTable from "../components/UI/CurrencyRatesTable/currencyRatesTable";
import MetalsRatesTable from "../components/UI/MetalsRatesTable/metalsRatesTable";
import AuthService from "../API/AuthService";


const Main = () => {
    return (
        <div className={"section__main"}>
            <CurrencyRatesTable/>
            <MetalsRatesTable/>
        </div>
    );
};

export default Main;