import { createFileRoute } from '@tanstack/react-router';
import { Login } from './login';
import { pageHead } from '@/lib/meta';
export const Route = createFileRoute('/auth')({ head: () => pageHead('Account sign-in – YESP', 'Sign in to access your private YESP profile and applications.'), component: Login });