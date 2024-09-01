import React, {useState} from 'react';
import "./AuthForm.css"
import {useAuth} from "../../../context/useAuth";
import AuthService from "../../../API/AuthService";
import {useNotifications} from "../../../context/useNotifications";

const AuthForm = ({onClose}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isNewbie, setIsNewbie] = useState(false);
    const { login } = useAuth();
    const { addNotification } = useNotifications();

    const registerUser = async (e) => {
        e.preventDefault()
        try{
            const data = await AuthService.register(username, password);
            if (data === 400) {
                addNotification(`bad request: ${data}`);
            } else if (data){
                addNotification(`User ${username} successfully registered`)
                await login(username, password); // autologin
                const userUuid = data.uuid
                console.log(userUuid)
            }
        } catch (e) {
            console.log(e)
        }
    }

    const loginUser = async (e) => {
        e.preventDefault()
        const error = await login(username, password);
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
                            <input className={"form__auth__input"} onChange={e => {setUsername(e.target.value)}} value={username} type={"text"} placeholder={"username"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_user"></use></svg>
                        </div>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} onChange={e => {setPassword(e.target.value)}} value={password} type={"password"} placeholder={"password"}/>
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
                            <input className={"form__auth__input"} onChange={e => {setUsername(e.target.value)}} value={username} type={"text"} placeholder={"username"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_user"></use></svg>
                        </div>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} onChange={e => {setPassword(e.target.value)}} value={password} type={"password"} placeholder={"password"}/>
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