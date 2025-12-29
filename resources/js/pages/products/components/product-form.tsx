import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { type Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductFormProps {
    product?: Product | null;
    onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price?.toString() || '',
            });
        } else {
            setFormData({
                name: '',
                price: '',
            });
        }
        setErrors({});
    }, [product]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const url = product ? `/products/${product.id}` : '/products';
        const method = product ? 'put' : 'post';

        router[method](url, {
            name: formData.name,
            price: parseFloat(formData.price),
        }, {
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                />
                {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Enter price"
                    required
                />
                {errors.price && (
                    <p className="text-sm text-red-600">{errors.price}</p>
                )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
                </Button>
            </div>
        </form>
    );
}