// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        user: null,
        notifications: [],
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const { setLoading, setUser, setNotifications, clearNotifications } = authSlice.actions;
export default authSlice.reducer;
