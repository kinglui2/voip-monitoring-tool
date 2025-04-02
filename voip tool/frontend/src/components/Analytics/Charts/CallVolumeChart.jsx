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

const CallVolumeChart = ({ data, timeRange }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Call Volume Over Time'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Calls'
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
                label: 'Call Volume',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.1)'
            }
        ]
    };

    return (
        <div className="chart-wrapper">
            <Line options={options} data={chartData} />
        </div>
    );
};

export default CallVolumeChart; 