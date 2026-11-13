import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, Loader2 } from 'lucide-react';
import { loginSchema } from '../../utils/validationSchemas.js';
import { useLogin } from '../../hooks/useAuth.js';

function LoginPage() {
  const { isLoading } = useSelector((state) => state.auth);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-gray-500 mt-2">Sign in to your inventory account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || loginMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {(isLoading || loginMutation.isPending) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
