import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Deal } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, List, Phone, UserCircle, Filter } from 'lucide-react';
import DealSheet from './components/deal-sheet';
import { MultiSelect } from '@/components/ui/multi-select';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deals',
        href: '/deals',
    },
];

interface DealsProps {
    deals: Deal[];
    users: Array<{ id: number; name: string }>;
    filters: {
        users: string[];
    };
}

const stageColors: Record<string, string> = {
    'new': 'bg-blue-500',
    'call': 'bg-yellow-500',
    'in-progress': 'bg-purple-500',
    'meeting': 'bg-orange-500',
    'deal-lost': 'bg-red-500',
    'close-deal': 'bg-green-500',
};

const stageLabels: Record<string, string> = {
    'new': 'New',
    'call': 'Call',
    'in-progress': 'In Progress',
    'meeting': 'Meeting',
    'deal-lost': 'Deal Lost',
    'close-deal': 'Close Deal',
};

const priorityColors: Record<string, string> = {
    'low': 'bg-gray-500',
    'medium': 'bg-yellow-500',
    'high': 'bg-red-500',
};

const priorityLabels: Record<string, string> = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
};

const stages = ['new', 'call', 'in-progress', 'meeting', 'close-deal', 'deal-lost'];

interface DraggableDealCardProps {
    deal: Deal;
    onClick: () => void;
}

function DraggableDealCard({ deal, onClick }: DraggableDealCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: deal.id!.toString(),
        data: { deal },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card
                className="cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm font-medium">
                            {deal.clientName}
                        </CardTitle>
                        <Badge 
                            className={`${priorityColors[deal.priority || 'medium']} text-white text-[10px] px-1.5 py-0 shrink-0`}
                        >
                            {priorityLabels[deal.priority || 'medium']}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-3 space-y-2">
                    {deal.phoneNumber && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{deal.phoneNumber}</span>
                        </div>
                    )}
                    {deal.assignedTo && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <UserCircle className="h-3 w-3" />
                            <span>{deal.assignedTo.name}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className={`size-2 rounded-full ${stageColors[deal.stage]}`} />
                        <span className="text-muted-foreground text-xs">
                            {new Date(deal.created_at || '').toLocaleDateString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface DroppableStageColumnProps {
    stage: string;
    deals: Deal[];
    onDealClick: (deal: Deal) => void;
}

function DroppableStageColumn({ stage, deals, onDealClick }: DroppableStageColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `stage-${stage}`,
        data: { stage, type: 'column' },
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`flex flex-col gap-3 transition-colors rounded-lg p-2 ${isOver ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
        >
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                <h3 className="font-semibold text-sm">
                    {stageLabels[stage]}
                </h3>
                <Badge variant="secondary" className="text-xs">
                    {deals.length}
                </Badge>
            </div>
            <SortableContext items={deals.map(d => d.id!.toString())} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 min-h-[200px]">
                    {deals.map((deal) => (
                        <DraggableDealCard
                            key={deal.id}
                            deal={deal}
                            onClick={() => onDealClick(deal)}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

export default function Deals({ deals, users, filters }: DealsProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<string[]>(filters.users.map(String));

    // Update selectedDeal when deals array changes (after Inertia reload)
    useEffect(() => {
        if (selectedDeal?.id) {
            const updatedDeal = deals.find(d => d.id === selectedDeal.id);
            if (updatedDeal) {
                setSelectedDeal(updatedDeal);
            }
        }
    }, [deals]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleAddDeal = () => {
        setSelectedDeal(null);
        setIsSheetOpen(true);
    };

    const handleEditDeal = (deal: Deal) => {
        setSelectedDeal(deal);
        setIsSheetOpen(true);
    };

    const getDealsByStage = (stage: string) => {
        return deals.filter(deal => deal.stage === stage);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const deal = event.active.data.current?.deal;
        if (deal) {
            setActiveDeal(deal);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDeal(null);

        if (!over) return;

        const dealId = active.id;
        const deal = deals.find(d => d.id?.toString() === dealId);
        
        if (!deal) return;

        // Check if dropped over a stage column
        const overData = over.data.current;
        let newStage: string | null = null;

        if (overData?.type === 'column') {
            newStage = overData.stage;
        } else if (overData?.deal) {
            // Dropped over another deal, use that deal's stage
            newStage = overData.deal.stage;
        }

        if (newStage && newStage !== deal.stage) {
            // Update the deal stage via API
            router.put(`/deals/${deal.id}`, {
                clientName: deal.clientName,
                stage: newStage,
            }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleFilterChange = (values: string[]) => {
        setSelectedUsers(values);
        router.get('/deals', { users: values }, { preserveState: true, preserveScroll: true });
    };

    const userOptions = [
        { value: 'all', label: 'All Users' },
        ...users.map(user => ({ value: user.id.toString(), label: user.name }))
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Deals" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
                        <p className="text-muted-foreground">
                            Manage your deals and track their progress
                        </p>
                    </div>
                    <Button onClick={handleAddDeal}>
                        <Plus className="mr-2 size-4" />
                        Add New Deal
                    </Button>
                </div>

                <Tabs defaultValue="kanban" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="kanban">
                                <LayoutGrid className="mr-2 size-4" />
                                Kanban
                            </TabsTrigger>
                            <TabsTrigger value="list">
                                <List className="mr-2 size-4" />
                                List
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by user:</span>
                            <div className="w-80">
                                <MultiSelect
                                    options={userOptions}
                                    selected={selectedUsers}
                                    onChange={handleFilterChange}
                                    placeholder="Select users..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kanban View */}
                    <TabsContent value="kanban" className="mt-4">
                        {deals.length === 0 ? (
                            <div className="text-muted-foreground flex items-center justify-center rounded-lg border border-dashed p-8">
                                No deals yet. Click "Add New Deal" to get started.
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCorners}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                                    {stages.map((stage) => (
                                        <DroppableStageColumn
                                            key={stage}
                                            stage={stage}
                                            deals={getDealsByStage(stage)}
                                            onDealClick={handleEditDeal}
                                        />
                                    ))}
                                </div>
                                <DragOverlay>
                                    {activeDeal ? (
                                        <Card className="rotate-3 shadow-2xl opacity-90">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium">
                                                    {activeDeal.clientName}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <span className={`size-2 rounded-full ${stageColors[activeDeal.stage]}`} />
                                                    <span className="text-muted-foreground text-xs">
                                                        {new Date(activeDeal.created_at || '').toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        )}
                    </TabsContent>

                    {/* List View */}
                    <TabsContent value="list" className="mt-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {deals.length === 0 ? (
                                <div className="text-muted-foreground col-span-full flex items-center justify-center rounded-lg border border-dashed p-8">
                                    No deals yet. Click "Add New Deal" to get started.
                                </div>
                            ) : (
                                deals.map((deal) => (
                                    <Card
                                        key={deal.id}
                                        className="cursor-pointer transition-shadow hover:shadow-md"
                                        onClick={() => handleEditDeal(deal)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-lg">{deal.clientName}</CardTitle>
                                                <Badge className={stageColors[deal.stage]}>
                                                    {stageLabels[deal.stage]}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-muted-foreground text-sm">
                                                <p>Created: {new Date(deal.created_at || '').toLocaleDateString()}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <DealSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                deal={selectedDeal}
                users={users}
            />
        </AppLayout>
    );
}
