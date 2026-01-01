import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
    MessageSquare, 
    Send, 
    Phone, 
    QrCode, 
    LogOut, 
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    XCircle,
    User
} from 'lucide-react';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'WhatsApp',
        href: '/whatsapp',
    },
];

interface Message {
    id: string;
    remoteJid: string;
    fromMe: boolean;
    message: any;
    messageTimestamp: number;
    pushName?: string;
}

interface Chat {
    jid: string;
    lastMessage: Message;
    unreadCount: number;
    messagesCount: number;
}

interface ConnectionState {
    state: 'connected' | 'disconnected' | 'connecting';
    user?: {
        id: string;
        name: string;
    };
}

export default function WhatsAppPage() {
    const [connectionState, setConnectionState] = useState<ConnectionState>({ state: 'disconnected' });
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [showPairingDialog, setShowPairingDialog] = useState(false);
    const [pairingNumber, setPairingNumber] = useState('');
    const [pairingCode, setPairingCode] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [newChatNumber, setNewChatNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket('ws://localhost:3001');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'qr') {
                setQrCode(data.qr);
                setShowQrDialog(true);
            } else if (data.type === 'connection') {
                setConnectionState({
                    state: data.state,
                    user: data.user
                });
                if (data.state === 'connected') {
                    setShowQrDialog(false);
                    setShowPairingDialog(false);
                    console.log('Connected to WhatsApp!');
                    fetchChats();
                }
            } else if (data.type === 'message') {
                // Add message to current chat if it matches
                if (selectedChat && data.message.remoteJid === selectedChat) {
                    setMessages(prev => [...prev, data.message]);
                }
                // Refresh chats list
                fetchChats();
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        // Fetch initial status
        fetchStatus();

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch('/whatsapp/status');
            const data = await response.json();
            setConnectionState({
                state: data.state,
                user: data.user
            });
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
    };

    const fetchChats = async () => {
        try {
            const response = await fetch('/whatsapp/chats');
            const data = await response.json();
            if (data.chats) {
                setChats(data.chats);
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    };

    const fetchMessages = async (jid: string) => {
        try {
            const response = await fetch(`/whatsapp/messages/${encodeURIComponent(jid)}`);
            const data = await response.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleRequestPairingCode = async () => {
        if (!pairingNumber) {
            alert('Please enter a phone number');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/whatsapp/request-pairing-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ phoneNumber: pairingNumber }),
            });

            const data = await response.json();
            if (data.code) {
                setPairingCode(data.code);
                console.log('Pairing code generated:', data.code);
            } else {
                alert(data.error || 'Failed to generate pairing code');
            }
        } catch (error) {
            alert('Failed to request pairing code');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const response = await fetch('/whatsapp/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            if (data.success) {
                console.log('Logged out successfully');
                setConnectionState({ state: 'disconnected' });
                setChats([]);
                setMessages([]);
                setSelectedChat(null);
            }
        } catch (error) {
            alert('Failed to logout');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        setLoading(true);
        try {
            const response = await fetch('/whatsapp/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    jid: selectedChat,
                    message: newMessage,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setNewMessage('');
                console.log('Message sent successfully');
            } else {
                alert(data.error || 'Failed to send message');
            }
        } catch (error) {
            alert('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleStartNewChat = async () => {
        if (!newChatNumber) {
            alert('Please enter a phone number');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/whatsapp/check-number', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ phoneNumber: newChatNumber }),
            });

            const data = await response.json();
            if (data.exists && data.jid) {
                setSelectedChat(data.jid);
                fetchMessages(data.jid);
                setNewChatNumber('');
                console.log('Chat opened');
            } else {
                alert('Number not found on WhatsApp');
            }
        } catch (error) {
            alert('Failed to check number');
        } finally {
            setLoading(false);
        }
    };

    const handleChatSelect = (jid: string) => {
        setSelectedChat(jid);
        fetchMessages(jid);
    };

    const getMessageText = (message: any) => {
        if (!message) return '';
        
        if (message.conversation) return message.conversation;
        if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
        if (message.imageMessage?.caption) return `📷 ${message.imageMessage.caption}`;
        if (message.videoMessage?.caption) return `🎥 ${message.videoMessage.caption}`;
        if (message.audioMessage) return '🎵 Audio';
        if (message.documentMessage?.fileName) return `📄 ${message.documentMessage.fileName}`;
        
        return '[Media]';
    };

    const formatPhoneNumber = (jid: string) => {
        return jid.replace('@s.whatsapp.net', '');
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="WhatsApp" />

            <div className="space-y-6">
                {/* Connection Status */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                WhatsApp Business
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                {connectionState.state === 'connected' ? (
                                    <>
                                        <Badge variant="default" className="bg-green-500">
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            Connected
                                        </Badge>
                                        {connectionState.user && (
                                            <span className="text-sm text-muted-foreground">
                                                {connectionState.user.name}
                                            </span>
                                        )}
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={handleLogout}
                                            disabled={loading}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Badge variant="secondary">
                                            <XCircle className="mr-1 h-3 w-3" />
                                            Disconnected
                                        </Badge>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setShowQrDialog(true)}
                                        >
                                            <QrCode className="mr-2 h-4 w-4" />
                                            Connect with QR
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setShowPairingDialog(true)}
                                        >
                                            <Phone className="mr-2 h-4 w-4" />
                                            Pairing Code
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Main Chat Interface */}
                {connectionState.state === 'connected' && (
                    <div className="grid grid-cols-12 gap-6">
                        {/* Chats List */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Chats</CardTitle>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="Enter phone number..."
                                        value={newChatNumber}
                                        onChange={(e) => setNewChatNumber(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleStartNewChat()}
                                    />
                                    <Button 
                                        size="sm" 
                                        onClick={handleStartNewChat}
                                        disabled={loading}
                                    >
                                        Start
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[600px]">
                                    {chats.map((chat) => (
                                        <div
                                            key={chat.jid}
                                            className={`p-4 cursor-pointer hover:bg-accent transition-colors border-b ${
                                                selectedChat === chat.jid ? 'bg-accent' : ''
                                            }`}
                                            onClick={() => handleChatSelect(chat.jid)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-medium truncate">
                                                            {formatPhoneNumber(chat.jid)}
                                                        </p>
                                                        {chat.lastMessage && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTimestamp(chat.lastMessage.messageTimestamp)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {chat.lastMessage && (
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {chat.lastMessage.fromMe && 'You: '}
                                                            {getMessageText(chat.lastMessage.message)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Messages */}
                        <Card className="col-span-8">
                            <CardHeader>
                                {selectedChat ? (
                                    <CardTitle>{formatPhoneNumber(selectedChat)}</CardTitle>
                                ) : (
                                    <CardTitle className="text-muted-foreground">
                                        Select a chat to start messaging
                                    </CardTitle>
                                )}
                            </CardHeader>
                            <CardContent>
                                {selectedChat ? (
                                    <>
                                        <ScrollArea className="h-[500px] pr-4">
                                            <div className="space-y-4">
                                                {messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                                msg.fromMe
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted'
                                                            }`}
                                                        >
                                                            {!msg.fromMe && msg.pushName && (
                                                                <p className="text-xs font-medium mb-1 opacity-70">
                                                                    {msg.pushName}
                                                                </p>
                                                            )}
                                                            <p className="text-sm break-words">
                                                                {getMessageText(msg.message)}
                                                            </p>
                                                            <p className={`text-xs mt-1 ${
                                                                msg.fromMe ? 'opacity-70' : 'text-muted-foreground'
                                                            }`}>
                                                                {formatTimestamp(msg.messageTimestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        </ScrollArea>

                                        <Separator className="my-4" />

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Type a message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                            />
                                            <Button 
                                                onClick={handleSendMessage}
                                                disabled={loading || !newMessage.trim()}
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-[600px] flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                            <p>Select a chat to view messages</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* QR Code Dialog */}
                <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Scan QR Code</DialogTitle>
                            <DialogDescription>
                                Open WhatsApp on your phone and scan this QR code
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center py-6">
                            {qrCode ? (
                                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                            ) : (
                                <div className="w-64 h-64 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Pairing Code Dialog */}
                <Dialog open={showPairingDialog} onOpenChange={setShowPairingDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Connect with Pairing Code</DialogTitle>
                            <DialogDescription>
                                Enter your phone number to receive a pairing code
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="1234567890 (without +)"
                                    value={pairingNumber}
                                    onChange={(e) => setPairingNumber(e.target.value)}
                                />
                            </div>
                            <Button 
                                className="w-full" 
                                onClick={handleRequestPairingCode}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Request Pairing Code
                            </Button>
                            {pairingCode && (
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Your pairing code:</p>
                                    <p className="text-3xl font-bold tracking-wider">{pairingCode}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Enter this code on your phone in: Settings {'>'} Linked Devices
                                    </p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
