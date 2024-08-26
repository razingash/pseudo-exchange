import React from 'react';
import {Route, Routes} from "react-router-dom";
import {publicRotes} from "../rotes/urls";

const AppRouter = () => {
    return (
        <Routes>
            {publicRotes.map(route =>
                <Route path={route.path} element={route.component} key={route.key}></Route>
            )}
        </Routes>
    );
};

export default AppRouter;