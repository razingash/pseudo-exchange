import "./styles/index.css";
import AppRouter from "./components/AppRouter";
import {BrowserRouter} from "react-router-dom";
import Header from "./components/UI/Header/Header";
import Notifications from "./components/UI/Notifications";
import {AuthProvider} from "./hooks/context/useAuth";
import {NotificationProvider} from "./hooks/context/useNotifications";

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <BrowserRouter>
                    <Header/>
                    <AppRouter/>
                </BrowserRouter>
                <Notifications/>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
