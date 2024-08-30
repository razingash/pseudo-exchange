import Main from "../pages/Main";

export const publicRotes = [
    {path: "/", component: <Main/>, key: "main"},
    {path: "/assets/", component: "assets", key: "assets"}
]

export const privateRotes = [
    {path: "/account/", component: "ds", key: "account"}
]