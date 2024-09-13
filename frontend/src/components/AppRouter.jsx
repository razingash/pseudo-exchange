import {Navigate, Route, Routes} from "react-router-dom";
import {privateRotes, publicRotes} from "../rotes/urls";
import {useApiInterceptors} from "../hooks/useApiInterceptors";
import UserStats from "./UI/UserStats/UserStats";
import Account from "../pages/Account";
import {useAuth} from "../hooks/context/useAuth";

const AppRouter = () => {
    useApiInterceptors();
    const { isAuth } = useAuth();

    return (
        <Routes>
            {isAuth && (
                <>
                    {privateRotes.map(route =>
                        <Route path={route.path} element={route.component} key={route.key} />
                    )}
                    <Route path="/account/*" element={<Account />}>
                        <Route path=":adapter" element={<UserStats />} />
                    </Route>
                </>
            )}
            {publicRotes.map(route =>
                <Route path={route.path} element={route.component} key={route.key}></Route>
            )}
             <Route path="*" element={<Navigate to="" replace />} key={"redirect"}/>
        </Routes>
    );
};

export default AppRouter;