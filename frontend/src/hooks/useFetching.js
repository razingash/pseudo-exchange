import React, {useState} from 'react';

export const useFetching = (callback, delay=0) => {
    const [isLoading, setIsLoading] = useState(false);
    const [responseCode, setResponseCode] = useState(200); //вьебать null, но тогда будет ошибка
    const [isSpammed, setIsSpammed] = useState(false);

    const fetching = async (...args) => {
        if (isSpammed) return;
        try {
            setIsLoading(true);
            setIsSpammed(true);
            return await callback(...args);
        } catch (e) {
            console.log(e.message, e.status)
            setResponseCode(e.status)
        } finally {
            setIsLoading(false)
            setTimeout(() => {
                setIsSpammed(false);
            }, delay)
        }
    }

    return [fetching, isLoading, responseCode];
};