import React, {createContext, useContext, useState} from "react";

//used only for errors that the user should be aware of / should be displayed only after the user clicks

const NotificationsContext = createContext(null);

export const useNotifications = () => {
    return useContext(NotificationsContext);
}

export const NotificationProvider = ({children}) => {
    const [notifications, setNotification] = useState([]);

    const addNotification = (message) => {
        const id = Date.now();
        setNotification(not => [...not, { id, message }]);
        setTimeout(() => removeNotification(id), 8000);
    }

    const removeNotification = (id) => {
        setNotification(not =>not.filter(notification => notification.id !== id));
    }

    return (
        <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification}}>
            {children}
        </NotificationsContext.Provider>
    );
}