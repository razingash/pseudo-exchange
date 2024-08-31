import Main from "../pages/Main";
import Assets from "../pages/Assets";
import Account from "../pages/Account";

export const publicRotes = [
    {path: "/", component: <Main/>, key: "main"},
    {path: "/assets/", component: <Assets/>, key: "assets"}
]

export const privateRotes = [
    {path: "/account/", component: <Account/>, key: "account"}
]