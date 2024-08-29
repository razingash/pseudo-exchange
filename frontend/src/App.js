import "./styles/index.css";
import AppRouter from "./components/AppRouter";
import {BrowserRouter} from "react-router-dom";
import Header from "./components/UI/Header/Header";
import {AuthProvider} from "./context/useAuth";
import {NotificationProvider} from "./context/useNotifications";
import Notifications from "./components/UI/Notifications";

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
