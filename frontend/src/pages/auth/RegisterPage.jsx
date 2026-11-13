import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, Loader2 } from 'lucide-react';
import { registerSchema } from '../../utils/validationSchemas.js';
import { useRegister } from '../../hooks/useAuth.js';

function RegisterPage() {
  const { isLoading } = useSelector((state) => state.auth);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create account
        </h1>
        <p className="text-gray-500 mt-2">Start managing your inventory</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full name
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

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
            placeholder="Create a password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm your password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || registerMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {(isLoading || registerMutation.isPending) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
