import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import ProductForm from './components/product-form';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

interface ProductsProps {
    products: Product[];
}

export default function ProductsIndex({ products }: ProductsProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleCreate = () => {
        setEditingProduct(null);
        setShowCreateForm(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowCreateForm(true);
    };

    const handleDelete = (product: Product) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/products/${product.id}`);
        }
    };

    const handleFormClose = () => {
        setShowCreateForm(false);
        setEditingProduct(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                        <p className="text-muted-foreground">
                            Manage your product catalog with names and prices.
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="mr-2 h-5 w-5" />
                            All Products ({products.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products.length === 0 ? (
                            <div className="text-center py-6">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No products</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating a new product.
                                </p>
                                <div className="mt-6">
                                    <Button onClick={handleCreate}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Product
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Deals</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>
                                                {formatPrice(product.price)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium">
                                                        {product.deals_count || 0} active deals
                                                    </div>
                                                    {product.recent_deals && product.recent_deals.length > 0 && (
                                                        <div className="space-y-1">
                                                            {product.recent_deals.map((deal) => (
                                                                <div key={deal.id} className="text-xs text-muted-foreground">
                                                                    <span className="font-medium">{deal.client_name}</span>
                                                                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                                        {deal.stage.replace('-', ' ')}
                                                                    </span>
                                                                    {deal.value && (
                                                                        <span className="ml-2">
                                                                            ${deal.value.toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {product.created_at ? 
                                                    new Date(product.created_at).toLocaleDateString() 
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(product)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
                <SheetContent side="right" className="w-[500px] sm:w-[700px]">
                    <SheetHeader className="pl-6">
                        <SheetTitle>
                            {editingProduct ? 'Edit Product' : 'Create Product'}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 pl-6 pr-6">
                        <ProductForm 
                            product={editingProduct} 
                            onClose={handleFormClose}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}