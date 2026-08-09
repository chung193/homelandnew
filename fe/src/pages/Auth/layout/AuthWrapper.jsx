import React from 'react';
import AuthBackground from './AuthBackground';

const AuthWrapper = ({ children }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <AuthBackground />
            <div className="relative z-10 bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-md">
                {children}
            </div>
        </div>
    );
};

export default AuthWrapper;