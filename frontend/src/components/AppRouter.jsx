import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import {privateRotes, publicRotes} from "../rotes/urls";
import {useAuth} from "../context/useAuth";

const AppRouter = () => {
    const {isAuth, refreshAccessToken, validateRefreshToken} = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const isValidToken = await validateRefreshToken();
            if ( isValidToken === true ) {
                await refreshAccessToken();
            }
            setIsLoading(false);
        }
        void checkToken();
    }, [validateRefreshToken, refreshAccessToken])

    if (isLoading) {
        return <></>;
    }

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