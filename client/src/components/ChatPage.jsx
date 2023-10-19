import { useContext, useEffect, useRef, useState } from "react";
import { ProfileImageGen } from "./ProfileImageGen";
import { UserContext } from "../context/UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import { Users } from "./Users";

export const ChatPage = () => {
  /* state for web socket and online client showcase */
  const [ws, setWs] = useState(null);
  const [onlineClient, setOnlineClient] = useState({});
  /* state for chat selection */
  const [selectedUser, setSelectedUser] = useState(null);
  /* state for new message */
  const [newMessage, setNewMessage] = useState("");
  /* state for sent messages showcase */
  const [messages, setMessages] = useState([]);
  /* state for offline users */
  const [offlineClient, setOfflineClient] = useState({});

  /* reference for sending the user to the bottom of the chat after sending message */
  const chatPositionRef = useRef();

  useEffect(() => {
    connectToWebSocket();
  }, []);

  /* function for connecting web socket */
  const connectToWebSocket = () => {
    const ws = new WebSocket("ws://localhost:5559");
    setWs(ws);
    ws.addEventListener("message", handleMsg);
    ws.addEventListener("close", () => {
      connectToWebSocket();
    });
  };

  /* function for showing online clients */
  const showOnlineClient = (clientArray) => {
    const onlineClient = {};
    clientArray.forEach(({ username, userId }) => {
      onlineClient[userId] = username;
    });
    setOnlineClient(onlineClient);
  };

  const handleMsg = (e) => {
    const messageData = JSON.parse(e.data);
    console.log({ messageData });
    if ("online" in messageData) {
      showOnlineClient(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };

  /* function to send new message */
  const sendMessage = (e) => {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUser,
        text: newMessage,
      })
    );
    setNewMessage("");
    setMessages((prev) => [
      ...prev,
      {
        text: newMessage,
        sender: id,
        recipient: selectedUser,
        _id: Date.now(),
      },
    ]);
  };

  /* for chat auto scroll to latest */
  useEffect(() => {
    const div = chatPositionRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /*  offline users */
  useEffect(() => {
    axios.get("/people").then((res) => {
      /* exclude own id, and online users */
      const offlineUsersArray = res.data
        .filter((user) => user._id !== id)
        .filter((user) => !Object.keys(onlineClient).includes(user._id));

      const offlineUsers = {};
      offlineUsersArray.forEach((users) => {
        offlineUsers[users._id] = users;
      });
      setOfflineClient(offlineUsers);
    });
  }, [onlineClient]);

  /*  fetching chat history*/
  useEffect(() => {
    if (selectedUser) {
      axios.get("/messages/" + selectedUser).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUser]);

  /* getting own username to exclude it from online client showcase */
  const { id } = useContext(UserContext);
  const onlineClientExcludeOwnUsername = { ...onlineClient };
  delete onlineClientExcludeOwnUsername[id];

  const messagesNotDuplicate = uniqBy(messages, "_id");

  return (
    <div className=" h-screen grid grid-cols-10">
      {/* left grid */}
      <div className="col-span-3 bg-purple-50 h-screen border-r border-purple-200">
        <h1 className="md:text-2xl text-lg md:font-bold font-bold px-3 md:px-6 pt-3 md:pt-8">
          Chats
        </h1>
        {/* online client list */}
        <div className="my-4">
          {Object.keys(onlineClientExcludeOwnUsername).map((userId) => (
            <Users
              key={userId}
              id={userId}
              online={true}
              username={onlineClientExcludeOwnUsername[userId]}
              onClick={() => setSelectedUser(userId)}
              selected={selectedUser}
            />
          ))}
          {/* offline client*/}
          {Object.keys(offlineClient).map((userId) => (
            <Users
              key={userId}
              id={userId}
              online={false}
              username={offlineClient[userId].username}
              onClick={() => setSelectedUser(userId)}
              selected={selectedUser}
            />
          ))}
        </div>
      </div>
      {/* right grid */}
      <div className="col-span-7 bg-purple-100  px-3 md:px-6 pt-3 md:pt-8 flex flex-col">
        <div className="md:text-2xl text-lg md:font-bold font-bold flex-grow">
          {!selectedUser && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Select User to Start the Conversation
              </p>
            </div>
          )}
          {!!selectedUser && (
            <div className="h-full relative">
              <div className="absolute top-0 right-0 left-0 bottom-2 overflow-y-scroll">
                {messagesNotDuplicate.map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.sender === id ? "text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "inline-block text-left rounded-lg py-2 px-4 my-2 mx-4 text-base font-medium " +
                        (message.sender === id
                          ? "bg-purple-300 "
                          : "bg-white text-gray-800 ")
                      }
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={chatPositionRef}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUser && (
          <form className="flex gap-2 mb-2" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="type a message..."
              className="border border-purple-200 p-2 flex-grow focus:outline-purple-300 "
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-200 py-2 px-3 border border-purple-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />{" "}
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
