import React from 'react';
import {useAuth} from "../../context/useAuth";

const Logout = () => {
    const {logout} = useAuth();
    return (
        <div onClick={async () => logout} className="header__auth__field">Log out</div>
    );
};

export default Logout;