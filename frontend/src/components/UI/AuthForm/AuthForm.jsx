import React, {useState} from 'react';
import "./AuthForm.css"

const AuthForm = ({onClose}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isNewbie, setIsNewbie] = useState(false);

    const registerUser = (e) => {
        e.preventDefault()
    }

    const loginUser = (e) => {
        e.preventDefault()
    }

    const changeAuth = () => {
        setIsNewbie(bool => !bool);
    }

    return (
        <div className={"section__auth"}>
            <div className={"field__auth"}>
                <div onClick={onClose} className={"field__exit"}>&#x274c;</div>
                {isNewbie ? (
                    <>
                    <form onSubmit={registerUser} className={"form__auth"} method={"POST"}>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} onChange={e => {setUsername(e.target.value)}} value={username} type={"text"} placeholder={"username"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_user"></use></svg>
                        </div>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} onChange={e => {setPassword(e.target.value)}} value={password} type={"password"} placeholder={"password"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_lock"></use></svg>
                        </div>
                        <button className={"form__auth__submit"}>submit</button>
                    </form>
                    <div onClick={changeAuth} className={"auth__change"}>sign in</div>
                    </>
                ) : (
                    <>
                    <form onSubmit={loginUser} className={"form__auth"} method={"POST"}>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} onChange={e => {setUsername(e.target.value)}} value={username} type={"text"} placeholder={"username"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_user"></use></svg>
                        </div>
                        <div className={"input__field"}>
                            <input className={"form__auth__input"} onChange={e => {setPassword(e.target.value)}} value={password} type={"password"} placeholder={"password"}/>
                            <svg className="svg__icon"><use xlinkHref="#icon_lock"></use></svg>
                        </div>
                        <button className={"form__auth__submit"}>submit</button>
                    </form>
                    <div onClick={changeAuth} className={"auth__change"}>sign up</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthForm;