import React, { useRef, useState } from "react";

export const OtpVerify = ({ onBack }) => {
  const inputRef = useRef([]);
  const [loading, setLoading] = useState(false);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  const pasteData = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRef.current[index]) inputRef.current[index].value = char;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Verify your email
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Enter the 6-digit code sent to your email
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="flex justify-center gap-2"
          onPaste={pasteData}
        >
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                ref={(e) => (inputRef.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
              />
            ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition disabled:opacity-50 ${
            loading ? "opacity-75" : ""
          }`}
        >
          {loading ? (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            "Verify Email"
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
        >
          Back to Signup
        </button>
      </div>
    </div>
  );
};

