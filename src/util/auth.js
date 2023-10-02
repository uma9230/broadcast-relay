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
