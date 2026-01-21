import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useApp();

    if (!user) {
        // Redirect to landing page if not authenticated
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
