import React, { useEffect, useRef } from 'react';
import './Chart.css';
import GlobalLoadingEffect from "../LoadingEffects/GlobalLoadingEffect";

const ChartMainWallet = ({ data }) => {
    const canvasRef = useRef(null);
    const tooltipRef = useRef(null);
    const padding = 50;
    let maxX = -Infinity;
    let minX = Infinity;
    let maxY = -Infinity;
    let minY = Infinity;
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
    const generalData = data && getGeneralData(data);

    const processGeneralData = (generalData) => {
        if (!generalData || generalData.length === 0) {
            console.error('Data is empty or undefined');
            return;
        }

        generalData.forEach(item => {
            const balance = item.balance;
            console.log(balance)
            minY = Math.min(minY, balance);
            maxY = Math.max(maxY, balance);
        });

        if (generalData.length > 0) {
            minX = generalData.balance;
            maxX = generalData.balance;
        }
    }

    const normalize = (value, minY, maxY, height) => {
        return height - padding - ((value - minY) / (maxY - minY)) * (height - 2 * padding);
    };

    const drawChart = (ctx, canvas, data) => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (isNaN(width) || isNaN(height)) {
            console.error('Invalid canvas dimensions:', width, height);
            return;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(25,25,31,0.4)');
        gradient.addColorStop(1, 'rgba(0,255,224,0.65)');

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

        ctx.strokeStyle = 'rgba(0, 200, 180, 1)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        console.log(data.length)
        ctx.moveTo(padding, normalize(data[0].balance, minY, maxY, height));
        for (let i = 1; i < data.length; i++) {
            const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
            const y = normalize(data[i].balance, minY, maxY, height);
            ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    };

    const findClosestPoint = (mouseX, width) => {
        const xStep = (width - 2 * padding) / (data.length - 1);
        const rawIndex = (mouseX - padding) / xStep;
        return Math.max(0, Math.min(data.length - 1, Math.round(rawIndex)));
    };

    const showTooltip = (event, data) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const width = canvas.width;
        const height = canvas.height;

        const closestIndex = findClosestPoint(mouseX, width);
        const closestX = padding + (closestIndex * (width - 2 * padding)) / (data.length - 1);
        const closestY = normalize(data[closestIndex].balance, minY, maxY, height);

        const tooltip = tooltipRef.current;
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY - 20}px`;
        tooltip.textContent = `Balance: ${data[closestIndex].balance.toFixed(2)}`;

        drawChart(ctx, canvas, data);

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
    };

    useEffect(() => {
        if (data && data.length > 0) {
            processGeneralData(generalData);
            console.log(data)
            console.log(generalData)
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            drawChart(ctx, canvas, generalData);

            const handleMouseMove = (e) => showTooltip(e, generalData);

            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', hideTooltip);

            return () => {
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseleave', hideTooltip);
            };
        }
    }, [data]);

    if (!data) {
        return (<GlobalLoadingEffect message={"Loading..."}/>)
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

export default ChartMainWallet;
