import {createContext, useContext, useEffect, useRef, useState} from "react";
import AuthService from "../../API/AuthService";
import AccountService from "../../API/UserRelatedServices/AccountService";
import {useFetching} from "../useFetching";

export const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem('token'));
    const [uuid, setUuid] = useState(null);
    const tokensRef = useRef({ access: null });
    const [fetchUserUuid] = useFetching(async () => {
        const response = await AccountService.getUserUuid();
        setUuid(response.uuid)
    })
    const [fetchLoginUser, , loginResponseCode] = useFetching(async (username, password) => {
        return await AuthService.login(username, password);
    })
    const [fetchLogoutUser] = useFetching(async (token) => {
        return await AuthService.logout(token);
    })
    const [fetchVerifiedToken, , verifiedTokenCode] = useFetching(async (token) => {
        await AuthService.verifyToken(token);
    })
    const [fetchRefreshToken] = useFetching(async (refreshToken) => {
        return await AuthService.refreshAccessToken(refreshToken);
    })

    const login = async (username, password) => {
        const data = await fetchLoginUser(username, password);
        console.log(data)
        if (loginResponseCode === 200) {
            localStorage.setItem('token', data.refresh)
            tokensRef.current.access = data.access;
            setIsAuth(true);
        } else {
            console.log("bad request")
            return "bad request"
        }
    }

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('token')
            if (!refreshToken) {
                setIsAuth(false);
                return;
            }
            if (refreshToken) {
                await fetchLogoutUser(refreshToken);
            }
            localStorage.removeItem('token');
            tokensRef.current.access = null;
            setIsAuth(false);
            setUuid(null);
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
            } else if (isValid === true) {
                const data = await fetchRefreshToken(refreshToken);
                tokensRef.current.access = data.access;
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
        const refreshToken = localStorage.getItem('token')
        if (refreshToken) {
            void await fetchVerifiedToken(refreshToken);
            if (verifiedTokenCode === 401) {
                await logout();
                return false
            }
            return true
        } else {
            await logout();
            return false
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            const isValidToken = await validateRefreshToken();
            if ( isValidToken === true ) {
                await refreshAccessToken();
            }
            if (isAuth) {
                void await fetchUserUuid();
            }
        }
        void initializeAuth();
    }, [isAuth]); // pseudo error -  missing dependencies

    return (
        <AuthContext.Provider value={{ isAuth, setIsAuth, tokensRef, uuid,
            login, logout, refreshAccessToken, validateRefreshToken
        }}> {children}
        </AuthContext.Provider>
    );
}
