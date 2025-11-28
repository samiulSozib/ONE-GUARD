import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, Smile, Send, MapPin, Phone, Mail, File, Image, Video, FileText, FileSpreadsheet, Presentation } from 'lucide-react';

const MessageBox = () => {
  const messages = [
    {
      id: 1,
      time: '4:02 PM',
      content: 'Hey John, I am looking for the best admin template. Could you please help me to find it out?',
      isCurrentUser: false
    },
    {
      id: 2,
      time: '4:02 PM',
      content: 'Stack admin is the responsive bootstrap 4 admin template.',
      isCurrentUser: true
    },
    {
      id: 3,
      time: '4:02 PM',
      content: 'Looks clean and fresh UI.',
      isCurrentUser: true
    }
  ];

  const files = [
    { name: 'new_1.jpg', date: '11 Jan 2021 23:32', icon: Image },
    { name: 'new_2.jpg', date: '11 Jan 2021 23:32', icon: Image },
    { name: 'avatar_12.mp4', date: '11 Jan 2021 23:32', icon: Video },
    { name: 'file1.docx', date: '11 Jan 2021 23:32', icon: FileText },
    { name: 'file2.xlsx', date: '11 Jan 2021 23:32', icon: FileSpreadsheet },
    { name: 'file3.pptx', date: '11 Jan 2021 23:32', icon: Presentation },
    { name: 'file4.pdf', date: '11 Jan 2021 23:32', icon: File }
  ];

  return (
    <div className="flex h-screen bg-white font-sans">
      {/* Main Chat Area - 2/3 width */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl ${
                    message.isCurrentUser
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message"
                  className="pr-12 h-12 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </div>
              <Button 
                size="icon" 
                className="h-12 w-12 bg-blue-500 hover:bg-blue-600 rounded-2xl"
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Contact Info - 1/3 width */}
      <div className="w-80 bg-white">
        <div className="p-6">
          
          {/* Contact Header */}
          <div className="text-center mb-8">
            <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-gray-200">
              <AvatarImage src="/avatars/lewis.jpg" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">LS</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold text-gray-900">Lewis Simmons</h2>
            <p className="text-sm text-gray-500">Guard</p>
          </div>

          {/* INFORMATION Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">INFORMATION</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>Q36 Raynor Fall</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>(229) 538-1421</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>khalid_watsica@reed.ca</span>
              </div>
            </div>
          </div>

          {/* FILE Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">FILE</h3>
            <div className="space-y-3">
              {files.map((file, index) => {
                const IconComponent = file.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.date}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <File className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;