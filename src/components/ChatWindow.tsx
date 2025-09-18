import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip,
  X,
  MessageCircle,
  Users
} from 'lucide-react';
import { useDatabaseChat } from '@/hooks/useDatabaseChat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import '@/utils/testSharedMessages';
import '@/utils/debugChat';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserId?: string;
}

const ChatWindow = ({ isOpen, onClose, selectedUserId }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    connectedUsers, 
    loading, 
    sendMessage, 
    startChat, 
    fetchMessages 
  } = useDatabaseChat();
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
    console.log('Conversation ID:', conversationId);
    if (conversationId) {
      setSelectedConversation(conversationId);
      markAsRead(conversationId);
    } else {
      console.error('Failed to create conversation');
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

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p.user_id !== user?.id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" alt="Chat" />
                  <AvatarFallback>
                    <MessageCircle className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
              <div>
                <CardTitle className="text-lg">Chat</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {connectedUsers.length} connected members
                </p>
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
        </CardHeader>

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
                      onClick={() => {
                        console.log('Clicked on user:', user);
                        handleStartChat(user.user_id);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback>
                            {(user.display_name || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.display_name || user.username || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Click to start chatting
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
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            isOwn ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "flex space-x-2 max-w-[70%]",
                            isOwn ? "flex-row-reverse space-x-reverse" : "flex-row"
                          )}>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={msg.profiles?.avatar_url || ''} />
                              <AvatarFallback>
                                {(msg.profiles?.display_name || 'U').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "rounded-lg px-3 py-2",
                              isOwn 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            )}>
                              <p className="text-sm">{msg.content}</p>
                              <p className={cn(
                                "text-xs mt-1",
                                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                  <p className="text-muted-foreground">
                    Select a conversation or start chatting with a connected member.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;
