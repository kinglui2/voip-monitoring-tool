import React, { useEffect } from 'react';
import { logout } from '../auth'; // Import the logout function
import { io } from 'socket.io-client'; // Importing Socket.io client

const LandingPage = () => {
    const socket = io('http://localhost:5000'); // Connecting to the Socket.io server

    useEffect(() => {
        // Listen for call updates
        socket.on('callCreated', (call) => {
            console.log('Call created:', call);
        });

        socket.on('callUpdated', (call) => {
            console.log('Call updated:', call);
        });

        socket.on('callDeleted', (callId) => {
            console.log('Call deleted:', callId);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, [socket]); // Added socket to the dependency array

    return (
        <div>
            <h1>Welcome to the VoIP Monitoring Tool</h1>
            <p>Your one-stop solution for monitoring VoIP calls in real-time.</p>
            {/* Additional UI components */}
            <button onClick={logout} className="bg-red-500 text-white rounded py-2 px-4">Logout</button>
            {/* Additional UI components */}
        </div>
    );
};

export default LandingPage;
