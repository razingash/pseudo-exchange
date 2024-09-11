import React from 'react';
import "./LoadingEffect.css"


const GlobalLoadingEffect = () => {
    return (
        <div className={"loading__field"}>
            <div className={"loading"}>
                <div className={"loading__arrow"}></div>
                <div className={"loading__arrow"}></div>
                <div className={"loading__arrow"}></div>
            </div>
            <div className={"loading__cell"}><div className={"loading__mark"}>Loading...</div></div>
        </div>
    );
};

export default GlobalLoadingEffect;