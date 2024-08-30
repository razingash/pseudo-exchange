import React, {useState} from 'react';
import AuthForm from "../AuthForm/AuthForm";
import {useAuth} from "../../../context/useAuth";
import {Link} from "react-router-dom";

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
            <Link to={""} className={"header__sitename__field"}>TBS</Link>
            <div className={"header__field"}>
                {isAuth &&
                    <Link to={"/account"} className={"header__item"}>account</Link>
                }
                <Link to={"/assets"} className={"header__item"}>assets</Link>
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