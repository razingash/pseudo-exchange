import React, {useState} from 'react';
import "./AuthForm.css"
import {useAuth} from "../../../../hooks/context/useAuth";
import {useNotifications} from "../../../../hooks/context/useNotifications";
import AuthService from "../../../../API/AuthService";
import {useInput} from "../../../../hooks/useInput";
import {useFetching} from "../../../../hooks/useFetching";

const AuthForm = ({onClose}) => {
    const username = useInput('');
    const password = useInput('');
    const [isNewbie, setIsNewbie] = useState(false);
    const { login } = useAuth();
    const { addNotification } = useNotifications();
    const [fetchRegisteredUser, isRegisteredUserLoading, regErrorCode] = useFetching(async () => {
        return await AuthService.register(username.value, password.value);
    }, 1000);
    const [fetchLoggedUser] = useFetching(async () => {
        return await login(username.value, password.value);
    }, 1000);


    const registerUser = async (e) => {
        e.preventDefault()
        const data = await fetchRegisteredUser();
        if (regErrorCode === 200){
            addNotification(`User ${username.value} successfully registered`)
            await fetchLoggedUser(); // autologin
            const userUuid = data.uuid
            console.log(userUuid)
        } else if (regErrorCode === 400) {
            addNotification(`bad request: ${regErrorCode}`);
        }
    }

    const loginUser = async (e) => {
        e.preventDefault()
        const error = await fetchLoggedUser();
        if (error) {
            addNotification(error)
        }
    }

    const changeAuth = () => {
        setIsNewbie(bool => !bool);
    }

    return (
        <div className={"section__auth"}>
            <div className={"field__auth"}>
                <div className={"field__exit"}><div onClick={onClose} className={"exit-mark"}>&#x274c;</div></div>
                {isNewbie ? (
                    <>
                    <form onSubmit={registerUser} className={"form__auth"}>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} {...username} type={"text"} placeholder={"username"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_user"></use></svg>
                        </div>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} {...password} type={"password"} placeholder={"password"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_lock"></use></svg>
                        </div>
                        <button className={"form__auth__submit"}>register</button>
                    </form>
                    <div onClick={changeAuth} className={"auth__change"}>sign in</div>
                    </>
                ) : (
                    <>
                    <form onSubmit={loginUser} className={"form__auth"}>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} {...username} type={"text"} placeholder={"username"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_user"></use></svg>
                        </div>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} {...password} type={"password"} placeholder={"password"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_lock"></use></svg>
                        </div>
                        <button className={"form__auth__submit"}>log in</button>
                    </form>
                    <div onClick={changeAuth} className={"auth__change"}>sign up</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthForm;