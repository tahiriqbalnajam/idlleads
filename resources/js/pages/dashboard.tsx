import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type Deal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, User, DollarSign, Calendar, Package } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    deals?: Deal[];
    products?: Array<{
        id: number;
        name: string;
        price: number;
        deals_count: number;
        deals: Array<{
            id: number;
            client_name: string;
            phone_number?: string;
            stage: string;
            priority?: string;
            value?: number;
            created_at: string;
        }>;
    }>;
}

const stageBadges: Record<string, string> = {
    'new': 'bg-blue-500 text-white',
    'call': 'bg-yellow-500 text-white',
    'in-progress': 'bg-orange-500 text-white',
    'meeting': 'bg-purple-500 text-white',
    'deal-lost': 'bg-red-500 text-white',
    'close-deal': 'bg-green-500 text-white',
};

const priorityBadges: Record<string, string> = {
    'high': 'bg-red-100 text-red-800 border-red-200',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'low': 'bg-green-100 text-green-800 border-green-200',
};

export default function Dashboard({ deals = [], products = [] }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    
    const formatCurrency = (value?: number): string => {
        if (!value || value === 0) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {auth.user?.name}
                        </p>
                    </div>
                </div>
                
                {/* Deals List */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Assigned Deals ({deals.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deals.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <p>No deals found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {deals.map((deal) => (
                                    <div
                                        key={deal.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-medium text-lg">{deal.clientName}</h4>
                                                <Badge className={stageBadges[deal.stage] || 'bg-gray-500 text-white'}>
                                                    {deal.stage.replace('-', ' ').toUpperCase()}
                                                </Badge>
                                                {deal.priority && (
                                                    <Badge variant="outline" className={priorityBadges[deal.priority] || 'bg-gray-100 text-gray-800'}>
                                                        {deal.priority.toUpperCase()}
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                {deal.phoneNumber && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{deal.phoneNumber}</span>
                                                    </div>
                                                )}
                                                
                                                {deal.assignedTo && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>Assigned to {deal.assignedTo.name}</span>
                                                    </div>
                                                )}
                                                
                                                {deal.product && (
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-3 w-3" />
                                                        <span>{deal.product.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-xs text-muted-foreground">
                                                Created: {formatDate(deal.created_at || '')}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="font-semibold text-lg">
                                                {formatCurrency(deal.value)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Products Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="mr-2 h-5 w-5" />
                            My Products with Deals ({products.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <p>No products with assigned deals found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {products.map((product) => (
                                    <Card key={product.id} className="border-l-4 border-l-blue-500">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{product.name}</CardTitle>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span>{formatCurrency(product.price)}</span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-sm">
                                                    {product.deals_count} deals
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {product.deals.length > 0 ? (
                                                <div className="space-y-3">
                                                    {product.deals.map((deal) => (
                                                        <div
                                                            key={deal.id}
                                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                                        >
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h5 className="font-medium">{deal.client_name}</h5>
                                                                    <Badge className={stageBadges[deal.stage] || 'bg-gray-500 text-white'}>
                                                                        {deal.stage.replace('-', ' ').toUpperCase()}
                                                                    </Badge>
                                                                    {deal.priority && (
                                                                        <Badge variant="outline" className={priorityBadges[deal.priority] || 'bg-gray-100 text-gray-800'}>
                                                                            {deal.priority.toUpperCase()}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                    {deal.phone_number && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Phone className="h-3 w-3" />
                                                                            <span>{deal.phone_number}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>Created: {formatDate(deal.created_at)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-right">
                                                                <div className="font-semibold">
                                                                    {formatCurrency(deal.value)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No deals found for this product.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
