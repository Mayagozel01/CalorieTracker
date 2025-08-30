import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    userName:null,
};

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        login:(state,action)=>{
            state.userName = action.payload.userName
        },
        logout:(state)=>state.userName = "Guest",
    }
})

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;