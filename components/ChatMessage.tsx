
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === Role.BOT;

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('**I. LÝ THUYẾT') || line.startsWith('I. LÝ THUYẾT')) {
          return (
            <div key={index} className="flex items-center mt-6 mb-3 text-blue-800 border-b-2 border-blue-100 pb-2">
              <i className="fas fa-book-reader mr-2"></i>
              <h2 className="text-lg font-bold">I. LÝ THUYẾT TRỌNG TÂM</h2>
            </div>
          );
        }
        if (line.startsWith('**II. CÂU HỎI') || line.startsWith('II. CÂU HỎI')) {
          return (
            <div key={index} className="flex items-center mt-8 mb-3 text-emerald-800 border-b-2 border-emerald-100 pb-2">
              <i className="fas fa-tasks mr-2"></i>
              <h2 className="text-lg font-bold">II. CÂU HỎI TRẮC NGHIỆM</h2>
            </div>
          );
        }
        if (line.startsWith('**III. GIẢI THÍCH') || line.startsWith('III. GIẢI THÍCH')) {
          return (
            <div key={index} className="flex items-center mt-8 mb-3 text-amber-800 border-b-2 border-amber-100 pb-2">
              <i className="fas fa-lightbulb mr-2"></i>
              <h2 className="text-lg font-bold">III. GIẢI THÍCH CHI TIẾT</h2>
            </div>
          );
        }
        
        // List items
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <li key={index} className="ml-4 list-none flex items-start text-gray-700 mb-2">
              <i className="fas fa-check text-[10px] mt-1.5 mr-3 text-blue-500"></i>
              <span>{line.trim().substring(2)}</span>
            </li>
          );
        }

        // Questions pattern (A. B. C. D.)
        if (line.match(/^[A-D]\./)) {
          return (
            <div key={index} className="ml-8 mb-1 text-gray-600 font-medium">
              <span className="text-blue-600 font-bold mr-2">{line.substring(0, 2)}</span>
              {line.substring(3)}
            </div>
          );
        }

        if (line.trim() === '') return <div key={index} className="h-2" />;
        
        return <p key={index} className="text-gray-700 leading-relaxed mb-2">{line}</p>;
      });
  };

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 ${isBot ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : 'bg-gradient-to-br from-gray-600 to-gray-800'}`}>
          <i className={`fas ${isBot ? 'fa-robot' : 'fa-user-graduate'}`}></i>
        </div>
        <div className={`mx-3 p-5 rounded-3xl shadow-sm ${isBot ? 'bg-white border border-gray-100 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
          {isBot ? (
            <div className="markdown-content text-[15px]">
              {formatContent(message.content)}
            </div>
          ) : (
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          )}
          <div className={`text-[9px] mt-3 uppercase tracking-widest font-bold opacity-40 ${isBot ? 'text-gray-500' : 'text-white'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
