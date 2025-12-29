import { useState, useRef } from 'react';
import { type Deal, type Product } from '@/types';
import { router } from '@inertiajs/react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import DealForm, { type DealFormData } from './deal-form';
import Activities, { type ActivitiesRef } from './activities';

interface DealSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deal?: Deal | null;
    users?: Array<{ id: number; name: string }>;
    products?: Product[];
}

export default function DealSheet({
    open,
    onOpenChange,
    deal,
    users = [],
    products = [],
}: DealSheetProps) {
    const [isSaved, setIsSaved] = useState(false);
    const activitiesRef = useRef<ActivitiesRef>(null);

    const handleSubmit = (data: DealFormData) => {
        const activities = activitiesRef.current?.getActivities();
        
        const submitData = {
            clientName: data.clientName,
            phoneNumber: data.phoneNumber,
            stage: data.stage,
            priority: data.priority,
            assignedTo: data.assignedTo,
            productId: data.productId,
            todos: activities?.todos.map(todo => ({
                text: todo.text,
                due_date: todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : null,
                completed: todo.completed,
            })),
            comments: activities?.comments.map(comment => ({
                text: comment.text,
            })),
            messages: activities?.messages.map(message => ({
                text: message.text,
            })),
        };

        if (deal?.id) {
            // Update existing deal
            router.put(`/deals/${deal.id}`, submitData, {
                onSuccess: () => {
                    setIsSaved(true);
                    onOpenChange(false);
                },
            });
        } else {
            // Create new deal
            router.post('/deals', submitData, {
                onSuccess: () => {
                    setIsSaved(true);
                    onOpenChange(false);
                },
            });
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset state when closing
            setIsSaved(false);
        }
        onOpenChange(newOpen);
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                side="right"
                className="w-[90vw] max-w-[90vw] p-0 sm:w-[90vw] sm:max-w-[90vw]"
            >
                <SheetHeader className="border-b p-6">
                    <SheetTitle>
                        {deal ? 'Edit Deal' : 'Add New Deal'}
                    </SheetTitle>
                </SheetHeader>
                
                <div className="grid h-[calc(100vh-5rem)] grid-cols-1 gap-6 overflow-auto p-6 lg:grid-cols-2">
                    {/* First Column - Deal Form */}
                    <div className="space-y-4">
                        <DealForm
                            deal={deal ?? undefined}
                            users={users}
                            products={products}
                            onSubmit={handleSubmit}
                        />
                    </div>

                    {/* Second Column - Activities */}
                    <div className="space-y-4">
                        <Activities ref={activitiesRef} disabled={!deal} deal={deal} />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
