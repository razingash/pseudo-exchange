import React from 'react';
import "../styles/main_page.css"
import RatesTable from "../components/UI/ratesTable/ratesTable";

const Main = () => {
    return (
        <div className={"section__trads"}>
            <RatesTable/>
        </div>
    );
};

export default Main;