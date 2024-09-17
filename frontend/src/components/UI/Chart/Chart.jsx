import React, {useEffect, useRef} from 'react';
import './Chart.css';
import GlobalLoadingEffect from "../LoadingEffects/GlobalLoadingEffect";

const ChartT = ({ data, strokeStyle, backgroundStyle, chartType }) => {
    const canvasRef = useRef(null);
    const tooltipRef = useRef(null);
    const padding = 50;
    const lineTypes = {
        'tr': 'transfers receiving',
        'ts': 'transfers sending',
        'cte': 'conversion to euro',
        'cfe': 'conversion from euro',
        'ad': 'assets dividends',
        'ap': 'asset purchase',
        'as': 'asset selling',
        'cto': 'credit taking out',
        'cp': 'credit payment'
    };
    const lineColors = {
        'tr': '#0080ff',
        'ts': '#ff0000',
        'cte': '#eeff00',
        'cfe': '#eeff00',
        'ad': '#ff00f5',
        'ap': '#9f4100',
        'as': '#0f008f',
        'cto': '#8000ff',
        'cp': '#0080ff'
    };

    let maxX = -Infinity;
    let minX = Infinity;
    let maxY = -Infinity;
    let minY = Infinity;
    let generalData;
    let actionData;
    let key = 'cost';
    const getGeneralData = () => {
        let balance = 0;
        return data.map(item => {
            balance += item.balance;
            return {
                timestamp: item.timestamp,
                balance: balance
            };
        })
    }
    const splitDataByAction = (data) => {
        const groupedData = {};
        data.forEach(item => {
            const action = item.action;

            if (!groupedData[action]) {
                groupedData[action] = [];
            }
            groupedData[action].push(item);
        });

        return groupedData;
    };

    switch (chartType) {
        case 0: // account chart for balance history
            key = 'balance';
            generalData = data && getGeneralData(data);
            actionData = data && splitDataByAction(data);
            break;
        default: // default for assets
            generalData = data;
            break;
    }
    switch (strokeStyle) {
        case 0:  // account chart for balance history
            strokeStyle = 'rgba(0,203,13, 1)';
            break
        default: // default for assets
            strokeStyle = 'rgba(0, 200, 180, 1)';
            break
    }
    switch (backgroundStyle) {
        case 0:  // account chart for balance history
            backgroundStyle = 'rgba(0,255,21,0.5)';
            break
        default: // default for assets
            backgroundStyle = 'rgba(0,255,224,0.65)';
            break
    }

    const processData = (data) => {
        if (!data || data.length === 0) {
            console.error('Data is empty or undefined');
            return;
        }
        data.forEach(item => {
            const number = item[key];
            minY = Math.min(minY, number);
            maxY = Math.max(maxY, number);
        });

        if (data.length > 0) {
            minX = data[0][key];
            maxX = data[data.length - 1][key];
        }
    }

    const normalize = (value, minY, maxY, height) => { // function for default chart
        return height - padding - ((value - minY) / (maxY - minY)) * (height - 2 * padding);
    };

    const drawChart = (ctx, canvas, data, isMainLine=true) => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (isNaN(width) || isNaN(height)) {
            console.error('Invalid canvas dimensions:', width, height);
            return;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, 0, height); // chart data line
        if (isMainLine) {
            // data background
            gradient.addColorStop(0, 'rgba(26,31,25,0.4)');
            gradient.addColorStop(1, backgroundStyle);

            // left numbers bar and lines
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.font = '12px Arial';
            ctx.fillStyle = '#ffffff';
            for (let i = minY; i <= maxY; i += (maxY - minY) / 5) {
                const y = normalize(i, minY, maxY, height);

                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();

                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(i.toFixed(2), padding - 10, y);
            }
        }

        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(padding, normalize(data[0][key], minY, maxY, height));
        for (let i = 1; i < data.length; i++) {
            const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
            const y = normalize(data[i][key], minY, maxY, height);
            ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    };

    const drawActionLine = (ctx, canvas, actionData, lineKey) => { // drawing additional lines
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        ctx.strokeStyle = lineColors[lineKey];
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(padding, normalize(Math.abs(actionData[0][key]), minY, maxY, height));
        for (let i = 1; i < actionData.length; i++) {
            const x = padding + (i * (width - 2 * padding)) / (actionData.length - 1);
            const y = normalize(Math.abs(actionData[i][key]), minY, maxY, height);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    const drawSelectedLines = (ctx, canvas) => {
        Object.keys(actionData).forEach((lineKey) => {
            if (actionData[lineKey] && actionData[lineKey].length > 0 && !["begin", "cte", "cfe"].includes(lineKey)) {
                drawActionLine(ctx, canvas, actionData[lineKey], lineKey);
            }
        });
    }

    const findClosestPoint = (mouseX, width) => {
        const xStep = (width - 2 * padding) / (data.length - 1);
        const rawIndex = (mouseX - padding) / xStep;
        return Math.max(0, Math.min(data.length - 1, Math.round(rawIndex)));
    };

    const showTooltip = (event, data) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const canvasLeft = canvas.offsetLeft;
        const canvasTop = canvas.offsetTop;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const width = canvas.width;
        const height = canvas.height;

        const closestIndex = findClosestPoint(mouseX, width);
        const closestX = padding + (closestIndex * (width - 2 * padding)) / (data.length - 1);
        const closestY = normalize(data[closestIndex][key], minY, maxY, height);

        const tooltip = tooltipRef.current;
        tooltip.style.display = 'block';
        if (chartType === 0) {
            tooltip.style.left = `${closestX + canvasLeft + 10}px`;
            tooltip.style.top = `${mouseY}px`;
        } else {
            tooltip.style.left = `${closestX + rect.left + 10}px`;
            tooltip.style.top = `${mouseY + rect.top}px`;
        }
        tooltip.textContent = `${key}: ${data[closestIndex][key].toFixed(2)}`;
        drawChart(ctx, canvas, data);
        if (chartType === 0) {
            drawSelectedLines(ctx, canvas);
        }

        ctx.strokeStyle = '#f700ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(closestX, padding);
        ctx.lineTo(closestX, height - padding);
        ctx.stroke();

        ctx.fillStyle = '#f700ff';
        ctx.beginPath();
        ctx.arc(closestX, closestY, 5, 0, Math.PI * 2);
        ctx.fill();
    };

    const hideTooltip = () => {
        const tooltip = tooltipRef.current;
        tooltip.style.display = 'none';
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawChart(ctx, canvas, generalData);
        if (chartType === 0) {
            drawSelectedLines(ctx, canvas);
        }
    };

    useEffect(() => {
        if (generalData && generalData.length > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            processData(generalData);
            drawChart(ctx, canvas, generalData);
            if (chartType === 0) {
                drawSelectedLines(ctx, canvas);
            }
            console.log(data)
            console.log(generalData)

            const handleMouseMove = (e) => showTooltip(e, generalData);

            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', hideTooltip);

            return () => {
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseleave', hideTooltip);
            };
        }
    }, [data]);

    if (!generalData) {
        return (<GlobalLoadingEffect message={"Loading"}/>)
    }

    return (
        <div className="field__chart">
            <div className="area__chart">
                <canvas className="chart__canvas" id="chartCanvas" ref={canvasRef}></canvas>
                <div className="chart__tooltip" id="chartTooltip" ref={tooltipRef}></div>
            </div>
        </div>
    );
};

export default ChartT;
