// auth.js
export const setAuthData = (user) => {
    localStorage.setItem("authUser", JSON.stringify(user));
};

export const getAuthData = () => {
    const authUser = localStorage.getItem("authUser");
    return authUser ? JSON.parse(authUser) : null;
};

export const clearAuthData = () => {
    localStorage.removeItem("authUser");
};

// Add the following functions
export const setStoredUserEmail = (email) => {
    localStorage.setItem("userEmail", email);
};

export const getStoredUserEmail = () => {
    return localStorage.getItem("userEmail");
};
