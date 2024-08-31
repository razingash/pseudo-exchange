import React, { useEffect, useRef } from 'react';
import './Chart.css';

const Chart = ({ data }) => {
    const canvasRef = useRef(null);
    const tooltipRef = useRef(null);
    const padding = 50;
    let maxX = -Infinity;
    let minX = Infinity;
    let maxY = -Infinity;
    let minY = Infinity;

    const processData = () => {
        if (!data || data.length === 0) {
            console.error('Data is empty or undefined');
            return;
        }

        data.forEach(item => {
            const cost = item.cost;
            minY = Math.min(minY, cost);
            maxY = Math.max(maxY, cost);
        });

        if (data.length > 0) {
            minX = data[0].cost;
            maxX = data[data.length - 1].cost;
        }
    };

    const normalize = (value, minY, maxY, height) => {
        return height - padding - ((value - minY) / (maxY - minY)) * (height - 2 * padding);
    };

    const drawChart = (ctx, canvas) => {
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
        ctx.moveTo(padding, normalize(data[0].cost, minY, maxY, height));
        for (let i = 1; i < data.length; i++) {
            const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
            const y = normalize(data[i].cost, minY, maxY, height);
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
        const index = Math.round((mouseX - padding) / xStep);
        return Math.max(0, Math.min(data.length - 1, index));
    };

    const showTooltip = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const width = canvas.width;
        const height = canvas.height;

        const closestIndex = findClosestPoint(mouseX, width);
        const closestX = padding + (closestIndex * (width - 2 * padding)) / (data.length - 1);
        const closestY = normalize(data[closestIndex].cost, minY, maxY, height);

        const tooltip = tooltipRef.current;
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY - 20}px`;
        tooltip.textContent = `Cost: ${data[closestIndex].cost.toFixed(2)}`;

        drawChart(ctx, canvas);

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
        drawChart(ctx, canvas);
    };

    useEffect(() => {
        if (data && data.length > 0) {
            processData();
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            drawChart(ctx, canvas);

            canvas.addEventListener('mousemove', showTooltip);
            canvas.addEventListener('mouseleave', hideTooltip);

            return () => {
                canvas.removeEventListener('mousemove', showTooltip);
                canvas.removeEventListener('mouseleave', hideTooltip);
            };
        }
    }, [data]);

    return (
        <div className="field__chart">
            <div className="area__chart">
                <canvas className="chart__canvas" id="chartCanvas" ref={canvasRef}></canvas>
                <div className="chart__tooltip" id="chartTooltip" ref={tooltipRef}></div>
            </div>
        </div>
    );
};

export default Chart;
