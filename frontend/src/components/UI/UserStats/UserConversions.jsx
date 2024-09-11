import React, {useEffect, useState} from 'react';
import {useAuth} from "../../../context/useAuth";
import {useFetching} from "../../../hooks/useFetching";
import ConversionService from "../../../API/UserRelatedServices/ConversionService";

const UserConversions = () => {
    const { uuid } = useAuth();
    const [conversions, setConversions] = useState([]);
    const [fetchConversions] = useFetching(async () => {
        const response = await ConversionService.getUserConversions(uuid);
        setConversions(response)
    })

    useEffect(() => {
        uuid && void fetchConversions();
    }, [])

    return (
        <>
            {conversions.length > 0 ? (conversions.map(conversion => (
                    <div className={"content__item"} key={conversion.time_stamp}>
                    <div className={"content__item__row"}>
                        <div className={""}>{conversion.amount} {conversion.starting_currency} to
                            {conversion.final_amount} {conversion.final_currency} with commission {conversion.conversion_percentage}% </div>
                    </div>
                </div>
            ))) : (
                <div>you haven't converted currencies yet</div>
            )}
        </>
    );
};

export default UserConversions;