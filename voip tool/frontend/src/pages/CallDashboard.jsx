import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CallDashboard = () => {
    const [calls, setCalls] = useState([]);
    const socket = io('http://localhost:5000'); // Connect to the Socket.io server

    useEffect(() => {
        // Fetch call data from the backend API
        const fetchCalls = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/calls');
                setCalls(response.data);
            } catch (error) {
                console.error('Error fetching calls:', error);
            }
        };

        fetchCalls();

        // Listen for real-time updates
        socket.on('callCreated', (call) => {
            setCalls((prevCalls) => [...prevCalls, call]);
            toast.success('Call created: ' + call.caller);
        });

        socket.on('callUpdated', (call) => {
            setCalls((prevCalls) => prevCalls.map(c => c._id === call._id ? call : c));
            toast.info('Call updated: ' + call.caller);
        });

        socket.on('callDeleted', (callId) => {
            setCalls((prevCalls) => prevCalls.filter(c => c._id !== callId));
            toast.error('Call deleted: ' + callId);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return (
        <div>
            <h1>Call Monitoring Dashboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Caller</th>
                        <th>Receiver</th>
                        <th>Status</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {calls.map(call => (
                        <tr key={call._id}>
                            <td>{call.caller}</td>
                            <td>{call.receiver}</td>
                            <td>{call.status}</td>
                            <td>{call.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ToastContainer />
        </div>
    );
};

export default CallDashboard;
