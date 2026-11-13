import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authApi from '../api/authApi.js';
import { loginStart, loginSuccess, loginFailure, logout } from '../stores/authSlice.js';

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onMutate: () => dispatch(loginStart()),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      dispatch(loginSuccess({ user, accessToken, refreshToken }));
      toast.success('Welcome back!');
      navigate('/dashboard');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Login failed';
      dispatch(loginFailure(message));
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onMutate: () => dispatch(loginStart()),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      dispatch(loginSuccess({ user, accessToken, refreshToken }));
      toast.success('Account created successfully!');
      navigate('/dashboard');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch(loginFailure(message));
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: () => {
      dispatch(logout());
      navigate('/login');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('Reset instructions sent to your email');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully!');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data.data;
    },
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};
