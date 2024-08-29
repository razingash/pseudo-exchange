import React, {useState} from 'react';
import AuthForm from "../AuthForm/AuthForm";
import {useAuth} from "../../../context/useAuth";

const Header = () => {
    const [isFormSpawned, setFormSpawned] = useState(false);
    const {isAuth, logout} = useAuth();

    const spawnAuthForm = () => {
        setFormSpawned(bool => !bool );
    }
    const removeAuthForm = () => {
        setFormSpawned(false);
    }

    return (
        <div className={"section__header"}>
            <div onClick={removeAuthForm} className={"header__sitename__field"}>TBS</div>
            <div className={"header__field"}>
                <a href={"#"} className={"header__item"}>link 1</a>
                <a href={"#"} className={"header__item"}>link 2</a>
                <a href={"#"} className={"header__item"}>link 3</a>
            </div>
            {isAuth ? (
                <div onClick={async () => await logout()} className={"header__auth__field"}>Log out</div>
            ) : (
                <>
                <div onClick={spawnAuthForm} className={"header__auth__field"}>Login / register</div>
                {isFormSpawned && <AuthForm onClose={removeAuthForm}/>}
                </>
            )}
        </div>
    );
};

export default Header;