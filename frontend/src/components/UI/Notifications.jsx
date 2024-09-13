import React from 'react';
import {useNotifications} from "../../hooks/context/useNotifications";
import ReactDOM from 'react-dom';

const Notifications = () => {
    const { notifications } = useNotifications();

    return ReactDOM.createPortal(
        <div className="notifications__list">
            {notifications.map((notification) => (
                <div key={notification.id} className="notification__field">
                    <div className="notification__content">{notification.message}</div>
                </div>
            ))}
        </div>,
        document.body
    );
};

export default Notifications;