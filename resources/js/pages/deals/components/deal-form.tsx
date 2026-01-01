import { useState, FormEvent } from 'react';
import { type Deal, type Product } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, TrendingUp, AlertCircle, Users, Package } from 'lucide-react';

interface DealFormProps {
    deal?: Deal;
    users?: Array<{ id: number; name: string }>;
    products?: Product[];
    onSubmit: (data: DealFormData) => void;
    disabled?: boolean;
}

export interface DealFormData {
    clientName: string;
    phoneNumber?: string;
    stage: string;
    priority: string;
    assignedTo?: number | null;
    productId?: number | null;
}

const stages = [
    { value: 'new', label: 'New' },
    { value: 'call', label: 'Call' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'deal-lost', label: 'Deal Lost' },
    { value: 'close-deal', label: 'Close Deal' },
];

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export default function DealForm({ deal, users = [], products = [], onSubmit, disabled = false }: DealFormProps) {
    const [clientName, setClientName] = useState(deal?.clientName || '');
    const [phoneNumber, setPhoneNumber] = useState(
        deal?.phoneNumber ? deal.phoneNumber.replace('+92', '') : ''
    );
    const [stage, setStage] = useState(deal?.stage || 'new');
    const [priority, setPriority] = useState(deal?.priority || 'medium');
    const [assignedTo, setAssignedTo] = useState<string>(
        deal?.assignedTo?.id?.toString() || ''
    );
    const [productId, setProductId] = useState<string>(
        deal?.product?.id?.toString() || ''
    );

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow digits and prevent starting with 0
        if (value === '' || (/^\d+$/.test(value) && !value.startsWith('0'))) {
            setPhoneNumber(value);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ 
            clientName, 
            phoneNumber: phoneNumber || undefined, 
            stage,
            priority,
            assignedTo: assignedTo && assignedTo !== 'none' ? parseInt(assignedTo) : null,
            productId: productId && productId !== 'none' ? parseInt(productId) : null,
        });
    };

    return (
        <Card className="h-fit border-2 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                        Deal Information
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientName" className="flex items-center gap-2 font-semibold">
                            <User className="h-4 w-4 text-primary" />
                            Client Name
                        </Label>
                        <Input
                            id="clientName"
                            placeholder="Enter client name"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            required
                            disabled={disabled}
                            className="border-2 focus:ring-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="flex items-center gap-2 font-semibold">
                            <Phone className="h-4 w-4 text-primary" />
                            Phone Number
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                                +92
                            </span>
                            <Input
                                id="phoneNumber"
                                placeholder="3001234567"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                disabled={disabled}
                                className="pl-12 border-2 focus:ring-2"
                                maxLength={10}
                            />
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Enter 10 digits without leading zero
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stage" className="flex items-center gap-2 font-semibold">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Stage
                        </Label>
                        <Select
                            value={stage}
                            onValueChange={setStage}
                            disabled={disabled}
                        >
                            <SelectTrigger id="stage" className="border-2">
                                <SelectValue placeholder="Select a stage" />
                            </SelectTrigger>
                            <SelectContent>
                                {stages.map((stageOption) => (
                                    <SelectItem
                                        key={stageOption.value}
                                        value={stageOption.value}
                                    >
                                        {stageOption.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="priority" className="flex items-center gap-2 font-semibold">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            Priority
                        </Label>
                        <Select
                            value={priority}
                            onValueChange={setPriority}
                            disabled={disabled}
                        >
                            <SelectTrigger id="priority" className="border-2">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                {priorities.map((priorityOption) => (
                                    <SelectItem
                                        key={priorityOption.value}
                                        value={priorityOption.value}
                                    >
                                        {priorityOption.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assignedTo" className="flex items-center gap-2 font-semibold">
                            <Users className="h-4 w-4 text-primary" />
                            Assigned To
                        </Label>
                        <Select
                            value={assignedTo}
                            onValueChange={setAssignedTo}
                            disabled={disabled}
                        >
                            <SelectTrigger id="assignedTo" className="border-2">
                                <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={user.id.toString()}
                                    >
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product" className="flex items-center gap-2 font-semibold">
                            <Package className="h-4 w-4 text-primary" />
                            Product
                        </Label>
                        <Select
                            value={productId}
                            onValueChange={setProductId}
                            disabled={disabled}
                        >
                            <SelectTrigger id="product" className="border-2">
                                <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {products.map((product) => (
                                    <SelectItem
                                        key={product.id}
                                        value={product.id!.toString()}
                                    >
                                        {product.name} - ${product.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md font-semibold" disabled={disabled}>
                        {deal ? 'Update Deal' : 'Create Deal'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
