import React from 'react';
import "./LoadingEffect.css"


const GlobalLoadingEffect = ({message}) => {
    return (
        <div className={"loading__field"}>
            <div className={"loading"}>
                <div className={"loading__arrow"}></div>
                <div className={"loading__arrow"}></div>
                <div className={"loading__arrow"}></div>
            </div>
            <div className={"loading__mark"}>{message}</div>
        </div>
    );
};

export default GlobalLoadingEffect;