import React, {useState} from 'react';
import AuthForm from "../AuthForm/AuthForm";

const Header = () => {
    const [isFormSpawned, setFormSpawned] = useState(false);
    const spawnAuthForm = () => {
        setFormSpawned(bool => !bool );
    }
    const removeAuthForm = () => {
        setFormSpawned(false);
    }
    const isUnlogged = true;

    return (
        <div className={"section__header"}>
            <div onClick={removeAuthForm} className={"header__sitename__field"}>TBS</div>
            <div className={"header__field"}>
                <a href={"#"} className={"header__item"}>link 1</a>
                <a href={"#"} className={"header__item"}>link 2</a>
                <a href={"#"} className={"header__item"}>link 3</a>
            </div>
            {isUnlogged ? (
                <div onClick={spawnAuthForm} className={"header__auth__field"}>Login / register</div>
            ) : (
                <div onClick={spawnAuthForm} className={"header__auth__field"}>Log out</div>
            )}
            {isFormSpawned && <AuthForm onClose={removeAuthForm}/>}
        </div>
    );
};

export default Header;