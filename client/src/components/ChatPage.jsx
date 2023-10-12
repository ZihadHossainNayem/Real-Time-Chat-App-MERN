export const ChatPage = () => {
  return (
    <div className=" h-screen grid grid-cols-10">
      {/* left grid */}
      <div className="col-span-3 bg-purple-50 h-screen p-2 md:p-8">
        <h1 className="md:text-xl text-base md:font-bold font-semibold">
          Chats
        </h1>
      </div>
      {/* right grid */}
      <div className="col-span-7 bg-purple-100 p-2 md:p-8 flex flex-col">
        <h1 className="md:text-xl text-base md:font-bold font-semibold flex-grow">
          Chat person name
        </h1>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="type a message..."
            className="border border-purple-200 p-2 flex-grow"
          />
          <button className="bg-purple-200 py-2 px-3 border border-purple-200">
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
        </div>
      </div>
    </div>
  );
};
