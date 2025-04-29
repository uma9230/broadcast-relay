// auth.js
export const setAuthData = (user) => {
    // Stringify the user object before storing it
    localStorage.setItem("authUser", typeof user === 'object' ? JSON.stringify(user) : user);
};

export const getAuthData = () => {
    const authUser = localStorage.getItem("authUser");
    if (!authUser) return null;
    
    // Try to parse as JSON, but return the string if it's not valid JSON
    try {
        return JSON.parse(authUser);
    } catch (e) {
        // If it's not valid JSON, it's probably just a string (username)
        return authUser;
    }
};

export const clearAuthData = () => {
    localStorage.removeItem("authUser");
};

// Add the following functions
export const setStoredUsername = (username) => {
    localStorage.setItem("username", username);
};

export const getStoredUsername = () => {
    return localStorage.getItem("username");
};
