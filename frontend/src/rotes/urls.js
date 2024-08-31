import Main from "../pages/Main";
import Assets from "../pages/Assets";
import Account from "../pages/Account";
import Asset from "../pages/Asset";

export const publicRotes = [
    {path: "/", component: <Main/>, key: "main"},
    {path: "/assets/", component: <Assets/>, key: "assets"},
    {path: "/assets/:ticker", component: <Asset/>, key: "asset"}
]

export const privateRotes = [
    {path: "/account/", component: <Account/>, key: "account"}
]