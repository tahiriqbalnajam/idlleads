import { useState, FormEvent } from 'react';
import { type Deal } from '@/types';
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

interface DealFormProps {
    deal?: Deal;
    users?: Array<{ id: number; name: string }>;
    onSubmit: (data: DealFormData) => void;
    disabled?: boolean;
}

export interface DealFormData {
    clientName: string;
    phoneNumber?: string;
    stage: string;
    priority: string;
    assignedTo?: number | null;
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

export default function DealForm({ deal, users = [], onSubmit, disabled = false }: DealFormProps) {
    const [clientName, setClientName] = useState(deal?.clientName || '');
    const [phoneNumber, setPhoneNumber] = useState(
        deal?.phoneNumber ? deal.phoneNumber.replace('+92', '') : ''
    );
    const [stage, setStage] = useState(deal?.stage || 'new');
    const [priority, setPriority] = useState(deal?.priority || 'medium');
    const [assignedTo, setAssignedTo] = useState<string>(
        deal?.assignedTo?.id?.toString() || ''
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
        });
    };

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                            id="clientName"
                            placeholder="Enter client name"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            required
                            disabled={disabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                +92
                            </span>
                            <Input
                                id="phoneNumber"
                                placeholder="3001234567"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                disabled={disabled}
                                className="pl-12"
                                maxLength={10}
                            />
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Enter 10 digits without leading zero
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stage">Stage</Label>
                        <Select
                            value={stage}
                            onValueChange={setStage}
                            disabled={disabled}
                        >
                            <SelectTrigger id="stage">
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
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                            value={priority}
                            onValueChange={setPriority}
                            disabled={disabled}
                        >
                            <SelectTrigger id="priority">
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
                        <Label htmlFor="assignedTo">Assigned To</Label>
                        <Select
                            value={assignedTo}
                            onValueChange={setAssignedTo}
                            disabled={disabled}
                        >
                            <SelectTrigger id="assignedTo">
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

                    <Button type="submit" className="w-full" disabled={disabled}>
                        {deal ? 'Update Deal' : 'Create Deal'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
