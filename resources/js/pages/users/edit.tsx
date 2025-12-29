import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface EditUserProps {
    user: {
        id: number;
        name: string;
        email: string;
        roles: string[];
    };
    roles: string[];
}

export default function EditUser({ user, roles }: EditUserProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    const toggleRole = (role: string) => {
        if (data.roles.includes(role)) {
            setData('roles', data.roles.filter((r) => r !== role));
        } else {
            setData('roles', [...data.roles, role]);
        }
    };

    return (
        <>
            <Head title="Edit User" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 pt-4 pl-4 pr-4">
                    <h1 className="text-3xl font-bold">Edit User</h1>

                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter name"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-muted-foreground">(leave blank to keep current)</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        placeholder="Confirm password"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Roles</Label>
                                    <div className="space-y-2">
                                        {roles.map((role) => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={role}
                                                    checked={data.roles.includes(role)}
                                                    onCheckedChange={() => toggleRole(role)}
                                                />
                                                <Label
                                                    htmlFor={role}
                                                    className="font-normal cursor-pointer"
                                                >
                                                    {role}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.roles && (
                                        <p className="text-sm text-red-500">{errors.roles}</p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        Update User
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}
