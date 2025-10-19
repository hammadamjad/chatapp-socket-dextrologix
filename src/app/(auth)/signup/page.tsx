'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SignupCredentials, AuthResponse } from '@/types';

export default function SignupPage() {
  const { data: session, status } = useSession();
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat-screen');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className='flex min-h-svh w-full items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (credentials.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setSuccess('Account created successfully! Please sign in.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/chat-screen' });
    } catch (error) {
      setError('An error occurred with Google sign-up');
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {error && (
                  <div className='text-red-500 text-sm text-center mb-4'>
                    {error}
                  </div>
                )}
                {success && (
                  <div className='text-green-500 text-sm text-center mb-4'>
                    {success}
                  </div>
                )}
                <Field>
                  <FieldLabel htmlFor='name'>Full Name</FieldLabel>
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    placeholder='John Doe'
                    value={credentials.name}
                    onChange={handleInputChange}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor='email'>Email</FieldLabel>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='m@example.com'
                    value={credentials.email}
                    onChange={handleInputChange}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor='password'>Password</FieldLabel>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    value={credentials.password}
                    onChange={handleInputChange}
                    required
                  />
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor='confirm-password'>
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id='confirm-password'
                    name='confirmPassword'
                    type='password'
                    value={credentials.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <FieldDescription>
                    Please confirm your password.
                  </FieldDescription>
                </Field>
                <FieldGroup>
                  <Field>
                    <Button type='submit' disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    <Button
                      variant='outline'
                      type='button'
                      onClick={handleGoogleSignUp}
                      disabled={isLoading}
                    >
                      Sign up with Google
                    </Button>
                    <FieldDescription className='px-6 text-center'>
                      Already have an account? <a href='/login'>Sign in</a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
