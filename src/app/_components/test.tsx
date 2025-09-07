"use client";

export const TestDateLogger = () => {
  function logCurrentDate() {
    const currentDate = new Date();
    console.log(currentDate);
    console.log("ISO", currentDate.toISOString());
  }

  return (
    <button
      onClick={logCurrentDate}
      className="rounded bg-blue-500 p-2 text-white"
    >
      Log Current Date
    </button>
  );
};
