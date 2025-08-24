import { configureStore } from '@reduxjs/toolkit';
import foodReducer from './slices/FoodSlice';

const store = configureStore({
  reducer: {
    food: foodReducer
  }
});

export default store;