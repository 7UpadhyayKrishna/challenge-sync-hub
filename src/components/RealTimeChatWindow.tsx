import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Send,
  Paperclip,
  X,
  Phone,
  Video,
  MoreVertical,
  MessageCircle,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface RealTimeChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserId?: string;
}

const RealTimeChatWindow = ({ isOpen, onClose, selectedUserId }: RealTimeChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    connectedUsers, 
    loading, 
    typingUsers,
    websocketConnected,
    sendMessage, 
    startChat, 
    fetchMessages,
    handleTyping,
    markAsRead
  } = useRealTimeChat();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUserId && isOpen) {
      handleStartChat(selectedUserId);
    }
  }, [selectedUserId, isOpen]);

  const handleStartChat = async (userId: string) => {
    console.log('Starting chat with user:', userId);
    const conversationId = await startChat(userId);
    console.log('Created conversation ID:', conversationId);
    if (conversationId) {
      setSelectedConversation(conversationId);
      await fetchMessages(conversationId);
      await markAsRead(conversationId);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    const success = await sendMessage(selectedConversation, message.trim());
    if (success) {
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (selectedConversation) {
      handleTyping(selectedConversation);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: any) => {
    if (!user) return null;
    return conversation.participants.find((p: any) => p.user_id !== user.id);
  };

  const getTypingUsers = () => {
    if (!selectedConversation) return [];
    return typingUsers.filter(t => t.conversation_id === selectedConversation);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MessageCircle className="w-8 h-8 text-primary" />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                  websocketConnected ? "bg-green-500" : "bg-red-500"
                )}></div>
              </div>
              <div>
                <DialogTitle className="text-xl">Real-Time Chat</DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <span>{connectedUsers.length} connected members</span>
                  <Badge variant={websocketConnected ? "default" : "destructive"} className="text-xs">
                    {websocketConnected ? (
                      <>
                        <Wifi className="w-3 h-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Connected Users Sidebar */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Connected Members</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {connectedUsers.length > 0 ? (
                  connectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => handleStartChat(user.user_id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback>
                              {(user.display_name || 'U').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                            user.is_online ? "bg-green-500" : "bg-gray-400"
                          )}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.display_name || user.username || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.is_online ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No connected members yet</p>
                    <p className="text-xs">Connect with members to start chatting</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start space-x-3",
                          msg.sender_id === user?.id ? "flex-row-reverse space-x-reverse" : ""
                        )}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.profiles?.avatar_url || ''} />
                          <AvatarFallback>
                            {(msg.profiles?.display_name || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2",
                          msg.sender_id === user?.id 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicators */}
                    {getTypingUsers().map((typing) => (
                      <div key={typing.user_id} className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <p className="text-sm text-muted-foreground">
                            {typing.user_name} is typing...
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      value={message}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={!websocketConnected}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || !websocketConnected}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {!websocketConnected && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠️ Connection lost. Messages will be saved when reconnected.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a member to start chatting</p>
                  <p className="text-sm">Click on a connected member to begin a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RealTimeChatWindow;
