const AuthCard = ({ children }) => {
    return (
        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-md">
            {children}
        </div>
    );
}

export default AuthCard