import { useState, ChangeEvent, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle2, MessageSquare, ListTodo, Plus, CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { type Deal } from '@/types';

interface ActivitiesProps {
    disabled?: boolean;
    deal?: Deal | null;
}

interface Todo {
    id: number;
    text: string;
    completed: boolean;
    dueDate?: Date;
    dueTime?: string;
}

interface Comment {
    id: number;
    text: string;
    createdAt: string;
}

interface Message {
    id: number;
    text: string;
    sentAt: string;
}

export interface ActivitiesRef {
    getActivities: () => {
        todos: Todo[];
        comments: Comment[];
        messages: Message[];
    };
}

const Activities = forwardRef<ActivitiesRef, ActivitiesProps>(({ disabled = false, deal = null }, ref) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    const [newTodo, setNewTodo] = useState('');
    const [newTodoDate, setNewTodoDate] = useState<Date>();
    const [newTodoTime, setNewTodoTime] = useState('');
    const [newComment, setNewComment] = useState('');
    const [newMessage, setNewMessage] = useState('');

    // Load existing data when deal is provided
    useEffect(() => {
        if (deal) {
            if (deal.todos && Array.isArray(deal.todos)) {
                setTodos(deal.todos.map((todo: any) => ({
                    id: todo.id,
                    text: todo.text,
                    completed: todo.completed,
                    dueDate: todo.due_date ? new Date(todo.due_date) : undefined,
                    dueTime: todo.due_time || undefined,
                })));
            }
            if (deal.comments && Array.isArray(deal.comments)) {
                setComments(deal.comments.map((comment: any) => ({
                    id: comment.id,
                    text: comment.text,
                    createdAt: new Date(comment.created_at).toLocaleString(),
                })));
            }
            if (deal.messages && Array.isArray(deal.messages)) {
                setMessages(deal.messages.map((message: any) => ({
                    id: message.id,
                    text: message.text,
                    sentAt: message.created_at ? new Date(message.created_at).toLocaleString() : 'Pending',
                })));
            }
        }
    }, [deal]);

    useImperativeHandle(ref, () => ({
        getActivities: () => ({
            todos,
            comments,
            messages,
        }),
    }));

    const addTodo = () => {
        if (newTodo.trim() && !disabled && deal?.id) {
            const todoData = {
                text: newTodo,
                due_date: newTodoDate ? format(newTodoDate, 'yyyy-MM-dd') : null,
                due_time: newTodoTime || null,
                completed: false,
            };

            router.post(`/deals/${deal.id}/todos`, todoData, {
                preserveScroll: true,
                only: ['deals'],
                onSuccess: () => {
                    setNewTodo('');
                    setNewTodoDate(undefined);
                    setNewTodoTime('');
                },
            });
        }
    };

    const addComment = () => {
        if (newComment.trim() && !disabled && deal?.id) {
            router.post(`/deals/${deal.id}/comments`, { text: newComment }, {
                preserveScroll: true,
                only: ['deals'],
                onSuccess: () => {
                    setNewComment('');
                },
            });
        }
    };

    const addMessage = () => {
        if (newMessage.trim() && !disabled && deal?.id) {
            router.post(`/deals/${deal.id}/messages`, { text: newMessage }, {
                preserveScroll: true,
                only: ['deals'],
                onSuccess: () => {
                    setNewMessage('');
                },
            });
        }
    };

    const toggleTodo = (id: number) => {
        if (!disabled && deal?.id) {
            router.patch(`/deals/${deal.id}/todos/${id}`, {}, {
                preserveScroll: true,
                only: ['deals'],
            });
        }
    };

    const deleteTodo = (id: number) => {
        if (!disabled && deal?.id) {
            router.delete(`/deals/${deal.id}/todos/${id}`, {
                preserveScroll: true,
                only: ['deals'],
            });
        }
    };

    const deleteComment = (id: number) => {
        if (!disabled && deal?.id) {
            router.delete(`/deals/${deal.id}/comments/${id}`, {
                preserveScroll: true,
                only: ['deals'],
            });
        }
    };

    const deleteMessage = (id: number) => {
        if (!disabled && deal?.id) {
            router.delete(`/deals/${deal.id}/messages/${id}`, {
                preserveScroll: true,
                only: ['deals'],
            });
        }
    };

    return (
        <Card className={`h-fit ${disabled ? 'opacity-50' : ''}`}>
            <CardHeader>
                <CardTitle>Activities</CardTitle>
                {disabled && (
                    <p className="text-muted-foreground text-sm">
                        Save the deal first to add activities
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="todos" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="todos" disabled={disabled}>
                            <ListTodo className="mr-2 size-4" />
                            Things to Do
                        </TabsTrigger>
                        <TabsTrigger value="comments" disabled={disabled}>
                            <MessageSquare className="mr-2 size-4" />
                            Comments
                        </TabsTrigger>
                        <TabsTrigger value="messages" disabled={disabled}>
                            <CheckCircle2 className="mr-2 size-4" />
                            WA Messages
                        </TabsTrigger>
                    </TabsList>

                    {/* Things to Do Tab */}
                    <TabsContent value="todos" className="space-y-4">
                        <div className="space-y-3">
                            <Textarea
                                placeholder="Add a task..."
                                value={newTodo}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewTodo(e.target.value)}
                                disabled={disabled}
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal flex-1",
                                                !newTodoDate && "text-muted-foreground"
                                            )}
                                            disabled={disabled}
                                        >
                                            <CalendarIcon className="mr-2 size-4" />
                                            {newTodoDate ? format(newTodoDate, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={newTodoDate}
                                            onSelect={setNewTodoDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <div className="relative flex-1">
                                    <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="time"
                                        value={newTodoTime}
                                        onChange={(e) => setNewTodoTime(e.target.value)}
                                        disabled={disabled}
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    onClick={addTodo}
                                    disabled={disabled}
                                >
                                    <Plus className="mr-2 size-4" />
                                    Add Task
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {todos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-start gap-2 rounded-md border p-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() => toggleTodo(todo.id)}
                                        disabled={disabled}
                                        className="size-4 cursor-pointer mt-1"
                                    />
                                    <div className="flex-1">
                                        <p
                                            className={
                                                todo.completed
                                                    ? 'text-muted-foreground line-through'
                                                    : ''
                                            }
                                        >
                                            {todo.text}
                                        </p>
                                        {(todo.dueDate || todo.dueTime) && (
                                            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                                                {todo.dueDate && (
                                                    <span className="flex items-center gap-1">
                                                        <CalendarIcon className="size-3" />
                                                        {format(todo.dueDate, "PPP")}
                                                    </span>
                                                )}
                                                {todo.dueTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {todo.dueTime}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteTodo(todo.id)}
                                        disabled={disabled}
                                        className="size-8 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Comments Tab */}
                    <TabsContent value="comments" className="space-y-4">
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                                disabled={disabled}
                                rows={3}
                            />
                            <Button
                                onClick={addComment}
                                size="sm"
                                disabled={disabled}
                            >
                                Add Comment
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="rounded-md border p-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm">{comment.text}</p>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {comment.createdAt}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteComment(comment.id)}
                                            disabled={disabled}
                                            className="size-8 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* WA Messages Tab */}
                    <TabsContent value="messages" className="space-y-4">
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Write a WhatsApp message to client..."
                                value={newMessage}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                                disabled={disabled}
                                rows={3}
                            />
                            <Button
                                onClick={addMessage}
                                size="sm"
                                disabled={disabled}
                            >
                                Send Message
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className="rounded-md border bg-primary/5 p-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm">{message.text}</p>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                Sent: {message.sentAt}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteMessage(message.id)}
                                            disabled={disabled}
                                            className="size-8 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
});

Activities.displayName = 'Activities';

export default Activities;
