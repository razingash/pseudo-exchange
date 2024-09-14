import React, {useEffect, useRef, useState} from 'react';
import {useAuth} from "../../../hooks/context/useAuth";
import {useFetching} from "../../../hooks/useFetching";
import ConversionService from "../../../API/UserRelatedServices/ConversionService";
import {useObserver} from "../../../hooks/useObserver";

const UserConversions = () => {
    const { uuid } = useAuth();
    const [conversions, setConversions] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const lastElement = useRef();
    const [fetchConversions, isFetchConversions] = useFetching(async () => {
        const response = await ConversionService.getUserConversions(uuid, page);
        setConversions((prevConversions) => {
            console.log(response)
            const newConversions = response.data.filter(
                (conversion) => !prevConversions.some((c) => c.time_stamp === conversion.time_stamp)
            );
            return [...prevConversions, ...newConversions];
        })
        setHasNext(response.has_next);
    })

    useObserver(lastElement, fetchConversions, isFetchConversions, hasNext, page, setPage);

    useEffect(() => {
        uuid && void fetchConversions();
    }, [uuid, page]);

    return (
        <>
            {conversions.length > 0 ? (conversions.map((conversion, index) => (
                <div ref={index === conversions.length - 1 ? lastElement : null} key={conversion.time_stamp} className={"content__item"} >
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