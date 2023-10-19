export const ProfileImageGen = ({ username, userId, online }) => {
  const colors = [
    "bg-red-200",
    "bg-green-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-teal-200",
    "bg-purple-200",
  ];

  /* color assigned to user profile image */
  const userIdDec = parseInt(userId, 16);
  const colorIndex = userIdDec % colors.length;
  const assignedColor = colors[colorIndex];
  return (
    <div
      className={
        "w-8 h-8 rounded-[50%] flex items-center justify-center relative " +
        assignedColor
      }
    >
      <span className="text-center w-full text-gray-800">{username[0]}</span>
      {online && (
        <div className="absolute w-[13px] h-[13px] bg-green-400 rounded-full -bottom-[2px] -right-[2px] border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-[13px] h-[13px] bg-gray-300 rounded-full -bottom-[2px] -right-[2px] border border-white"></div>
      )}
    </div>
  );
};
