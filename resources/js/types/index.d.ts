import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    roles?: string[];
    permissions?: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Deal {
    id?: number;
    clientName: string;
    phoneNumber?: string;
    stage: string;
    priority?: string;
    assignedTo?: {
        id: number;
        name: string;
    } | null;
    value?: number;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    todos?: Array<{
        id: number;
        text: string;
        completed: boolean;
        due_date?: string;
        due_time?: string;
        created_at: string;
        updated_at: string;
    }>;
    comments?: Array<{
        id: number;
        text: string;
        user_id: number;
        created_at: string;
        updated_at: string;
    }>;
    messages?: Array<{
        id: number;
        text: string;
        user_id: number;
        status: string;
        sent_at?: string;
        created_at: string;
        updated_at: string;
    }>;
}
