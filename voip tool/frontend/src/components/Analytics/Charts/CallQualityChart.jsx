import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const CallQualityChart = ({ data, timeRange }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Call Quality Metrics'
            }
        },
        scales: {
            y: {
                min: 0,
                max: 5,
                title: {
                    display: true,
                    text: 'MOS Score'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            }
        }
    };

    const chartData = {
        labels: data.map((_, index) => {
            const date = new Date();
            date.setHours(date.getHours() - (data.length - 1 - index));
            return date.toLocaleTimeString();
        }),
        datasets: [
            {
                label: 'MOS Score',
                data: data,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(255, 99, 132, 0.1)'
            }
        ]
    };

    return (
        <div className="chart-wrapper">
            <Line options={options} data={chartData} />
        </div>
    );
};

export default CallQualityChart; 