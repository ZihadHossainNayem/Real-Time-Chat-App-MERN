import { ProfileImageGen } from "./ProfileImageGen";

export const Users = ({ id, onClick, selected, username, online }) => {
  return (
    <div
      key={id}
      className={
        "md:text-lg font-medium border-b border-purple-100 flex items-center gap-2 cursor-pointer " +
        (id === selected ? "bg-purple-100" : "")
      }
      onClick={() => onClick(id)}
    >
      {id === selected && <div className="w-1 bg-purple-400 h-16"></div>}
      <div className="flex items-center gap-2 px-3 md:px-6 py-4 ">
        <ProfileImageGen username={username} userId={id} online={online} />
        <span>{username}</span>
      </div>
    </div>
  );
};
