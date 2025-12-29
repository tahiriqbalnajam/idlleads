import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Permissions',
        href: '/users/permissions/manage',
    },
];

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

interface PermissionsProps {
    roles: Role[];
    permissions: string[];
}

export default function Permissions({ roles, permissions }: PermissionsProps) {
    return (
        <>
            <Head title="Manage Permissions" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 pt-4 pl-4 pr-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Role Permissions</h1>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Back to Users
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {roles.map((role) => (
                            <RolePermissionCard
                                key={role.id}
                                role={role}
                                availablePermissions={permissions}
                            />
                        ))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}

interface RolePermissionCardProps {
    role: Role;
    availablePermissions: string[];
}

function RolePermissionCard({ role, availablePermissions }: RolePermissionCardProps) {
    const { data, setData, put, processing } = useForm({
        permissions: role.permissions,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/permissions/${role.id}`, {
            preserveScroll: true,
        });
    };

    const togglePermission = (permission: string) => {
        if (data.permissions.includes(permission)) {
            setData('permissions', data.permissions.filter((p) => p !== permission));
        } else {
            setData('permissions', [...data.permissions, permission]);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            {role.name}
                        </CardTitle>
                        <CardDescription>
                            Manage permissions for this role
                        </CardDescription>
                    </div>
                    <Badge variant="secondary">
                        {data.permissions.length} {data.permissions.length === 1 ? 'Permission' : 'Permissions'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {availablePermissions.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {availablePermissions.map((permission) => (
                                <div key={permission} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`${role.id}-${permission}`}
                                        checked={data.permissions.includes(permission)}
                                        onChange={() => togglePermission(permission)}
                                        className="rounded border-gray-300"
                                    />
                                    <label
                                        htmlFor={`${role.id}-${permission}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {permission}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No permissions available yet.</p>
                            <p className="text-sm mt-2">
                                Create permissions in your application to manage role access.
                            </p>
                        </div>
                    )}
                    
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Update Permissions
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
