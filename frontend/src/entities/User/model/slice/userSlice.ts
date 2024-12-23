import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserSchema } from '../types/user';

const initialState: UserSchema = {
  _inited: false,
  authData: undefined,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<User>) => {
      state.authData = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    initAuthData: (state) => {
      const user = localStorage.getItem('user');
      if (user) {
        state.authData = JSON.parse(user);
      }
      state._inited = true;
    },
    logout: (state) => {
      state.authData = undefined;
      localStorage.removeItem('user');
    },
  },
});

export const { actions: userActions } = userSlice;
export const { reducer: userReducer } = userSlice; 