import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Package, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { forgotPasswordSchema } from '../../utils/validationSchemas.js';
import { useForgotPassword } from '../../hooks/useAuth.js';

function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => setSubmitted(true),
    });
  };

  if (submitted) {
    return (
      <div className="w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Check your email
        </h1>
        <p className="text-gray-500 mb-6">
          If an account exists, we've sent password reset instructions to your email.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot password?
        </h1>
        <p className="text-gray-500 mt-2">
          Enter your email and we'll send you reset instructions
        </p>
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

        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset instructions'
          )}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
