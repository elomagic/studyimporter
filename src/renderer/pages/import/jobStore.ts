import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './jobSlice';

const store = configureStore({
  reducer: {
    job: jobReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
