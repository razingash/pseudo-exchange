import React from 'react';
import CurrencyRatesTable from "../components/UI/CurrencyRatesTable/currencyRatesTable";
import MetalsRatesTable from "../components/UI/MetalsRatesTable/metalsRatesTable";


const Main = () => {
    return (
        <div className={"section__main"}>
            <CurrencyRatesTable/>
            <MetalsRatesTable/>
        </div>
    );
};

export default Main;