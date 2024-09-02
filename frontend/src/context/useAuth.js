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

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('token')
            if (!refreshToken) {
                setIsAuth(false);
            } else {
                await AuthService.logout(refreshToken);
                localStorage.removeItem('token')
                setIsAuth(false);
            }
        } catch (e) {
            console.log("error")
        }
    };

    const refreshAccessToken = async () => {
        try {
            const isValid = await validateRefreshToken();
            const refreshToken = localStorage.getItem('token')
            if (!refreshToken) {
                await logout();
            }
            else if ( isValid === true ) {
                const data = await AuthService.refreshAccessToken(refreshToken)
                tokensRef.current = {access: data.access, refresh: data.refresh};
                setIsAuth(true);
                return data.access
            } else {
                await logout();
            }
        } catch (e) {
            console.error("Token refreshing failed:", e);
            await logout();
        }
    }

    const validateRefreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem('token')
            if (refreshToken) {
                const isTokenValid = await AuthService.verifyToken(refreshToken);
                if (isTokenValid === 401) {
                    await logout();
                    return false
                }
                return true
            } else {
                await logout();
                return false
            }
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <AuthContext.Provider value={{isAuth, setIsAuth, tokensRef, login, logout, refreshAccessToken, validateRefreshToken}}>
            { children }
        </AuthContext.Provider>
    );
}
