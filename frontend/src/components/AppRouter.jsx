import React, {useEffect} from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import {privateRotes, publicRotes} from "../rotes/urls";
import {useAuth} from "../context/useAuth";

const AppRouter = () => {
    const {isAuth, setIsAuth, refreshAccessToken} = useAuth();
    useEffect(() => {
        const checkToken = async () => {
            const refreshToken = localStorage.getItem('token')
            if (refreshToken) {
                await refreshAccessToken
            }
            setIsAuth(true);
        }
        void checkToken();
    }, [])

    return (
        <Routes>
            {isAuth &&
                privateRotes.map(route =>
                    <Route path={route.path} element={route.component} key={route.key}></Route>
                )
            }
            {publicRotes.map(route =>
                <Route path={route.path} element={route.component} key={route.key}></Route>
            )}
             <Route path="*" element={<Navigate to="" replace />} key={"redirect"}/>
        </Routes>
    );
};

export default AppRouter;