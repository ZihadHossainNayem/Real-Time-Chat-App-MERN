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

  const { id, setId, uname, setUname } = useContext(UserContext);

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
      if (messageData.sender === selectedUser) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  /* function to send new message */
  const sendMessage = (e, file = null) => {
    /* check if there is files included */
    if (e) e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUser,
        text: newMessage,
        file,
      })
    );

    if (file) {
      axios.get("/messages/" + selectedUser).then((res) => {
        setMessages(res.data);
      });
    } else {
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
    }
  };

  /* function for log out by resetting cookie*/
  const logout = () => {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUname(null);
    });
  };

  /* function for file attachment */
  const fileAttachment = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        data: reader.result,
        name: e.target.files[0].name,
      });
    };
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

  const onlineClientExcludeOwnUsername = { ...onlineClient };
  delete onlineClientExcludeOwnUsername[id];

  const messagesNotDuplicate = uniqBy(messages, "_id");

  return (
    <div className=" h-screen grid grid-cols-10">
      {/* left grid */}
      <div className="flex flex-col col-span-3 bg-purple-50 h-screen border-r border-purple-200">
        <h1 className="md:text-2xl text-lg md:font-bold font-bold px-3 md:px-6 pt-3 md:pt-8">
          Chats
        </h1>
        {/* online client list */}
        <div className="my-4 flex-grow">
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
        {/* log out */}
        <div className="md:text-xl text-base font-semibold my-2 flex flex-col md:flex-row space-y-2 md:space-y-0 items-center justify-between md:mx-6 mx-2">
          <span className="mr-4 text-gray-700 flex items-center gap-1 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-lg">{uname}</span>
          </span>
          <button
            className="text-gray-700 bg-purple-200 px-2 py-[6px] rounded border border-purple-300 text-lg"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </div>
      {/* right grid */}
      <div className="col-span-7 bg-purple-100  px-2 pt-3 md:pt-8 flex flex-col">
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
                        "inline-block text-left rounded-lg py-2 px-4 my-2 mx-4 md:text-base text-sm font-medium " +
                        (message.sender === id
                          ? "bg-purple-300 "
                          : "bg-white text-gray-800 ")
                      }
                    >
                      {message.text}
                      {message.file && (
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>

                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                            href={
                              axios.defaults.baseURL + "/upload/" + message.file
                            }
                          >
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatPositionRef}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUser && (
          <form className="flex gap-1 mb-2" onSubmit={sendMessage}>
            {/* attachment button */}
            <label className="bg-purple-300 p-2 rounded cursor-pointer">
              <input type="file" className="hidden" onChange={fileAttachment} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </label>
            {/* message input field */}
            <input
              type="text"
              placeholder="type a message..."
              className="border border-purple-200 flex-grow p-2 rounded focus:outline-purple-300 min-w-[30px]"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            {/* message send button */}
            <button type="submit" className="bg-purple-300 p-2 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
