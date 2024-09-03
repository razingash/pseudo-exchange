import React from 'react';
import UserWallets from "../components/UI/UserWallets/UserWallets";
import UserStats from "../components/UI/UserStats/UserStats";

const Account = () => {
    return (
        <div className={"section__main section__main__list"}>
            <UserWallets/>
            <UserStats/>
        </div>
    );
};

export default Account;