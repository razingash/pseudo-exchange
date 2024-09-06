import React, {useState} from 'react';
import UserWallets from "../components/UI/UserWallets/UserWallets";
import UserStats from "../components/UI/UserStats/UserStats";

const Account = () => {
    const [isNewSelectedFormSpawned, setIsNewSelectedFormSpawned] = useState(false);
    const [activeFormType, setActiveFormType] = useState(null);

    const spawnNewForm = (formType) => {
        setActiveFormType(formType);
        setIsNewSelectedFormSpawned(bool => !bool);
    }

    const removeNewSelectedForm = () => {
        setIsNewSelectedFormSpawned(false);
        setActiveFormType(null)
    }

    return (
        <div className={"section__main section__main__list"}>
            <UserWallets props={{isNewSelectedFormSpawned, activeFormType,
                spawnNewForm: () => spawnNewForm('wallet'), removeNewSelectedForm}}/>
            <UserStats props={{isNewSelectedFormSpawned, activeFormType,
                spawnNewForm: () => spawnNewForm('stats'), removeNewSelectedForm}}/>
        </div>
    );
};

export default Account;