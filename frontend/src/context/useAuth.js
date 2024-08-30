import {createContext, useContext, useRef, useState} from "react";
import AuthService from "../API/AuthService";

export const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useState(false);
    const tokensRef = useRef({access: null});

    const login = async (username, password) => {
        try {
            const data = await AuthService.login(username, password);
            if (data === 400) {
                console.log("bad request")
                return "bad request"
            }
            localStorage.setItem('token', data.refresh)
            tokensRef.current = {access: data.access, refresh: data.refresh};
            setIsAuth(true);
        } catch (e) {
            console.log('Login Error:', e)
        }
    }

    const logout = () => {
        /*const token = localStorage.getItem('token')
        await ApiAuth.logout(token)*/
        setIsAuth(false);
        localStorage.removeItem('token')
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('token')
            const data = await AuthService.refreshAccessToken(refreshToken)
            tokensRef.current = {access: data.access, refresh: data.refresh};
            return data.access
        } catch (e) {
            console.log(e);
            logout();
        }
    }

    return (
        <AuthContext.Provider value={{isAuth, setIsAuth, tokensRef, login, logout, refreshAccessToken}}>
            { children }
        </AuthContext.Provider>
    );
}
