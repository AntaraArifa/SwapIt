import { X, Send } from "lucide-react";

const ChatBox = ({ visible, onClose, instructor }) => {
  if (!visible || !instructor) return null;

  return (
    <div className="fixed bottom-4 right-4 w-100 h-120 bg-white border border-gray-300 shadow-xl rounded-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center border-b p-3 bg-blue-50 rounded-t-lg">
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">
            {instructor.fullname}
          </h4>
          <p className="text-xs text-gray-500">Instructor</p>
        </div>
        <button onClick={onClose}>
          <X className="w-4 h-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>

      {/* Message Body */}
      <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700">
        {/* Add message history here */}
      </div>

      {/* Input Box at Bottom */}
      <div className="flex border-t p-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="p-2 text-blue-600 hover:text-blue-800">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
