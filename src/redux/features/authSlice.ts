import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../lib/axios';

interface UserCredentials {
  email: string;
  password: string;
}

interface forgetCredentials {
  email: string;
}

interface validateOtpCredentials {
  email: string;
  otp: string;
}

interface ChangePasswordCredentials {
  userId: string;
  token: string;
  password: string;
}

interface ChangePasswordResponse {
  message?: string;
}

interface GoogleUserCredentials {
  googleUid: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
}

interface AuthState {
  user: any | null;
  token: any | null;
  loading: boolean;
  error: any | null;
  isCompleted?: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isCompleted: false
};

interface RegisterCredentials {
  email: string;
  password: string;
  role: string; // You can adjust the type as needed
  name: string;
}

// Define the response type for registration
interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserResponse {
  success: boolean;
  message?: string;
  data?: object;
}

interface ForgetResponse {
  message?: string;
}

interface ValidateOtpResponse {
  success: boolean;
  message?: string;
  data?: object;
}

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterCredentials
>('auth/register', async (userCredentials) => {
  const request = await axiosInstance.post(`/auth/signup`, userCredentials);
  const response = await request.data;
  return response;
});

// Async thunk for logging in a user
export const loginUser = createAsyncThunk<UserResponse, UserCredentials>(
  'auth/login',
  async (userCredentials) => {
    const request = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      userCredentials,
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' //this line solved cors
        }
      }
    );

    const response = await request.data;

    localStorage.setItem('investment', JSON.stringify(response.data.accessToken));
    return response;
  }
);



export const authWithFbORGoogle = createAsyncThunk<
  UserResponse,
  GoogleUserCredentials
>('auth/google', async (googleUserCredentials) => {
  const request = await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/google`,
    googleUserCredentials,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' //this line solved cors
      }
    }
  );
  const response = await request.data;
  localStorage.setItem('investment', JSON.stringify(response.data.accessToken));
  return response;
});
// forgot password

export const requestOtp = createAsyncThunk<ForgetResponse, forgetCredentials>(
  'auth/forget',
  async (userCredentials) => {
    const request = await axios.patch(
      `${import.meta.env.VITE_API_URL}/auth/forget`,
      userCredentials,
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' //this line solved cors
        }
      }
    );
    const response = await request.data;

    return response;
  }
);

// validate request OTP
export const validateRequestOtp = createAsyncThunk<
  ValidateOtpResponse,
  validateOtpCredentials
>('auth/validate', async (userCredentials) => {
  const request = await axios.patch(
    `${import.meta.env.VITE_API_URL}/auth/validate`,
    userCredentials,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' //this line solved cors
      }
    }
  );
  const response = await request.data;

  return response;
});

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
    `${import.meta.env.VITE_API_URL}/auth/verifyemail`, { email, otp });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// patch new password
export const changePassword = createAsyncThunk<
  ChangePasswordResponse,
  ChangePasswordCredentials
>('auth/reset', async (userCredentials) => {
  const request = await axios.patch(
    `${import.meta.env.VITE_API_URL}/auth/reset`,
    userCredentials,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json', //this line solved cors
        // Authorization: `Bearer ${userCredentials.token}`
      }
    }
  );
  const response = await request.data;

  return response;
});


export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({ email}: { email: string}, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
    `${import.meta.env.VITE_API_URL}/auth/resend-otp`, { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const logout = createAsyncThunk<void>('user/logout', async () => {
  localStorage.removeItem('investment');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError(state) {
      state.error = null; // Reset the error state
    },
    updateAuthIsCompleted: (state, action) => {
      state.user.isCompleted = action.payload;
    },
    updateAuthIsValided: (state, action) => {
      state.user.isValided = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
        state.token = null;
      })
      .addCase(loginUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.token = action.payload.data.accessToken;
        const decodedUser = jwtDecode(action.payload.data.accessToken);

        // Create a mutable copy of the decoded user
        const userWithPrivileges = { ...decodedUser };

        // Assign privileges if they exist in the response (only for staff)
        if (
          userWithPrivileges.role === 'staff' &&
          action.payload.data.privileges
        ) {
          userWithPrivileges.privileges = action.payload.data.privileges;
        }

        state.user = userWithPrivileges;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = 'Please Check Your Login Credentials';
        state.token = null;
      })
      .addCase(authWithFbORGoogle.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
        state.token = null;
      })
      .addCase(authWithFbORGoogle.fulfilled, (state, action: any) => {
        state.loading = false;
        state.token = action.payload.data.accessToken;
        const decodedUser = jwtDecode(action.payload.data.accessToken);

        // Create a mutable copy of the decoded user
        const userWithPrivileges = { ...decodedUser };

        // Assign privileges if they exist in the response (only for staff)
        if (
          userWithPrivileges.role === 'staff' &&
          action.payload.data.privileges
        ) {
          userWithPrivileges.privileges = action.payload.data.privileges;
        }

        state.user = userWithPrivileges;
        state.error = null;
      })
      .addCase(authWithFbORGoogle.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = 'Please Check Your Login Credentials';
        state.token = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null; // Clear user state on logout
        state.error = null;
        state.token = null;
      }).addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to change password';
      }).addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        const { accessToken } = action.payload.data;
        const decoded = jwtDecode(accessToken);
        
        state.loading = false;
        state.token = accessToken;
        state.user = {
          ...decoded,
          isValided: true
        };
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Verification failed';
      })
      
  }
});

export const { resetError ,updateAuthIsCompleted, updateAuthIsValided} = authSlice.actions;
export default authSlice.reducer;
