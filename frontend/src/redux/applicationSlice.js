import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name: 'application',
    initialState: {
        applicants: null, // Consider initializing as empty array []
    },
    reducers: {
        setAllApplicants: (state, action) => {
            state.applicants = action.payload;
        }
    }
});

export const { setAllApplicants } = applicationSlice.actions;
export default applicationSlice.reducer;