import {createContext, useContext, useState} from "react";
import ApiAuth from "../API/AuthService";

export const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useState(false);

    const login = async (username, password) => {
        try {
            const data = await ApiAuth.login(username, password);
            if (data === 400) {
                console.log("bad request")
                return "bad request"
            }
            localStorage.setItem('token', data.auth_token)
            setIsAuth(true);
        } catch (e) {
            console.log('Login Error:', e)
        }
    }
    const logout = async () => {
        const token = localStorage.getItem('token')
        await ApiAuth.logout(token)
        setIsAuth(false);
        localStorage.removeItem('token')
    };

    return (
        <AuthContext.Provider value={{isAuth, login, logout }}>
            { children }
        </AuthContext.Provider>
    );
}
