import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";

type TabType = "messages" | "contacts";

const ChatPage = () => {
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("messages");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user: currentUser } = useAuthStore();
  const {
    messages,
    chatContacts,
    allContacts,
    selectedUser,
    isLoading,
    error,
    getChatContacts,
    getAllContacts,
    getMessages,
    sendMessage,
    setSelectedUser,
    clearError,
  } = useChatStore();

  // Fetch appropriate contacts based on active tab
  useEffect(() => {
    if (activeTab === "messages") {
      getChatContacts();
    } else {
      getAllContacts();
    }
  }, [activeTab, getChatContacts, getAllContacts]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserSelect = (user: (typeof chatContacts)[0]) => {
    setSelectedUser(user);
    clearError();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !messageText.trim()) return;

    await sendMessage(selectedUser._id, messageText);
    setMessageText("");
  };

  // Get current users list based on active tab
  const currentUsers = activeTab === "messages" ? chatContacts : allContacts;

  return (
    <div className="h-screen flex bg-slate-800">
      {/* Left Sidebar - User List */}
      <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col shadow-xl">
        {/* Sidebar Header with Current User Profile */}
        <div className="px-5 py-5 border-b border-slate-700 bg-slate-900">
          {/* Current User Profile Card */}
          {currentUser && (
            <div className="mb-5 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                {/* Avatar with online status */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg      
  ring-2 ring-emerald-500/20"
                  >
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg"></div>
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {currentUser.username}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-400">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Buttons */}
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                activeTab === "messages"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                activeTab === "contacts"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              Contacts
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {isLoading && currentUsers.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm">Loading...</p>
              </div>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="flex items-center justify-center h-32 px-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">
                  {activeTab === "messages"
                    ? "No conversations yet"
                    : "No contacts available"}
                </p>
                {activeTab === "messages" && (
                  <p className="text-slate-500 text-xs">
                    Start a new conversation from Contacts
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              {currentUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full px-5 py-4 flex items-center gap-3 transition-all duration-200 ${
                    selectedUser?._id === user._id
                      ? "bg-slate-800 border-l-4 border-blue-500"
                      : "hover:bg-slate-800/50 border-l-4 border-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* User info */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-white truncate">
                      {user.username}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  {selectedUser?._id === user._id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center gap-3 shadow-lg">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">
                  {selectedUser.username}
                </h3>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {error && (
                <div className="bg-red-900/50 border border-red-700/50 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">👋</span>
                    </div>
                    <p className="text-slate-400 font-medium">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === currentUser?.id;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-fadeIn`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-lg ${
                            isOwnMessage
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                              : "bg-slate-700 text-slate-100"
                          }`}
                        >
                          {message.text && (
                            <p className="leading-relaxed">{message.text}</p>
                          )}
                          {message.image && (
                            <img
                              src={message.image}
                              alt="Message attachment"
                              className="mt-2 rounded-lg max-w-full"
                            />
                          )}
                          <p
                            className={`text-xs mt-1.5 ${
                              isOwnMessage ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-slate-900 border-t border-slate-700 px-6 py-4 shadow-2xl">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500  
  focus:border-transparent caret-white transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none      
  focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg              
  hover:shadow-blue-500/25"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Send"
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State - No User Selected */
          <div className="flex-1 flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span className="text-6xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Select a conversation
              </h3>
              <p className="text-slate-400 text-lg">
                Choose from {activeTab === "messages" ? "Messages" : "Contacts"}{" "}
                to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
