import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './pages/Register'; // Import the Register component
import LandingPage from './pages/LandingPage';
import CallDashboard from './pages/CallDashboard'; // Import CallDashboard
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} /> // Add the Register route
        
        {/* Protected routes with role-based access */}
        <ProtectedRoute 
          path="/" 
          exact 
          component={LandingPage} 
          roles={['Admin', 'Supervisor', 'Agent']} 
        />
        <ProtectedRoute 
          path="/dashboard" 
          component={CallDashboard} 
          roles={['Admin', 'Supervisor', 'Agent']} 
        />
      </Switch>
    </Router>
  );
}

export default App
