import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { Building2, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <>
            <Head title="Log in" />
            
            <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
                {/* Left Side - Login Form */}
                <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        {/* Logo and Header */}
                        <div className="flex flex-col items-center space-y-6">
                            <Link href="/" className="flex items-center gap-2">
                                <img 
                                    src="/lead-generation.png" 
                                    alt="RealState Logo" 
                                    className="h-12 w-12 object-contain"
                                />
                                <span className="text-2xl font-bold">RealState</span>
                            </Link>
                            
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Welcome back
                                </h1>
                                <p className="text-muted-foreground">
                                    Sign in to your account to continue
                                </p>
                            </div>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-950/20 dark:border-green-900">
                                <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {status}
                                </div>
                            </div>
                        )}

                        {/* Login Form */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-4">
                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium">
                                                Email address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="name@example.com"
                                                    className="pl-10 h-11"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="text-sm font-medium">
                                                    Password
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="text-sm font-medium hover:underline"
                                                        tabIndex={5}
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Enter your password"
                                                    className="pl-10 h-11"
                                                />
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        {/* Remember Me */}
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label 
                                                htmlFor="remember" 
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                Keep me signed in
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-medium"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner className="mr-2" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign in
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>

                                    {/* Register Link */}
                                    {canRegister && (
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">
                                                Don't have an account?{' '}
                                                <TextLink 
                                                    href={register()} 
                                                    tabIndex={6}
                                                    className="font-medium hover:underline"
                                                >
                                                    Sign up for free
                                                </TextLink>
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* Right Side - Feature Showcase */}
                <div className="hidden lg:block relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary/90 dark:via-primary/80 dark:to-primary/70">
                    <div className="absolute inset-0 bg-grid-white/10" />
                    <div className="relative h-full flex flex-col items-center justify-center p-12 text-primary-foreground">
                        <div className="max-w-md space-y-8">
                            {/* Hero Section */}
                            <div className="space-y-4">
                                <Building2 className="h-16 w-16 opacity-90" />
                                <h2 className="text-4xl font-bold leading-tight">
                                    Manage your real estate business with ease
                                </h2>
                                <p className="text-lg opacity-90">
                                    A comprehensive platform to manage deals, properties, and communications all in one place.
                                </p>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4 pt-8">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Deal Management</h3>
                                        <p className="text-sm opacity-80">
                                            Track leads, manage pipeline, and close deals faster
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">WhatsApp Integration</h3>
                                        <p className="text-sm opacity-80">
                                            Communicate with clients directly from the platform
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Team Collaboration</h3>
                                        <p className="text-sm opacity-80">
                                            Work together with your team seamlessly
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial */}
                            <div className="pt-8 border-t border-primary-foreground/20">
                                <blockquote className="space-y-3">
                                    <p className="text-lg italic">
                                        "This platform has transformed how we manage our real estate operations. Everything we need in one place."
                                    </p>
                                    <footer className="text-sm font-medium opacity-80">
                                        — Sarah Johnson, Real Estate Agency Owner
                                    </footer>
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
