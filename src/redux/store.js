import { configureStore } from '@reduxjs/toolkit';
import foodReducer from './slices/FoodSlice';
import AuthSlice from './slices/AuthSlice';

const store = configureStore({
  reducer: {
    food: foodReducer,
    auth: AuthSlice,
  }
});

export default store;