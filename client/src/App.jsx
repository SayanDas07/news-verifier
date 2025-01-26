/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Zap, History, Trash2, XCircle } from "lucide-react";

const API_URI = "https://news-verifier.onrender.com";

function App() {
  const [newsContent, setNewsContent] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchAccuracy = async () => {
      try {
        const response = await fetch(`${API_URI}/accuracy`);
        if (!response.ok) throw new Error("Failed to fetch accuracy");
        const data = await response.json();
        setAccuracy(data.accuracy);
      } catch (err) {
        console.error("Error fetching accuracy:", err);
      }
    };

    fetchAccuracy();
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(history);
  }, []);

  const saveSearchHistory = (search) => {
    const updatedHistory = [search, ...searchHistory.slice(0, 4)];
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const clearTextArea = () => {
    setNewsContent("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAnalyze = async () => {
    try {
      setError("");
      setResult("");
      setIsLoading(true);

      const response = await fetch(`${API_URI}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newsContent }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      const prediction = data.prediction === 1 ? "Real News" : "Fake News";
      setResult(prediction);

      saveSearchHistory({ content: newsContent, result: prediction });
    } catch (err) {
      setError("Error analyzing news. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-white/20 backdrop-blur-xl border-r border-white/30 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-extrabold flex items-center space-x-3 text-slate-800">
            <History className="h-7 w-7 text-blue-600" />
            <span>Search History</span>
          </h3>
          {searchHistory.length > 0 && (
            <button
              onClick={clearSearchHistory}
              title="Clear History"
              className="group p-2 hover:bg-red-50 rounded-full transition-all duration-300"
            >
              <Trash2 className="h-5 w-5 text-red-500 group-hover:scale-110 group-hover:rotate-6" />
            </button>
          )}
        </div>
        {searchHistory.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {searchHistory.map((search, index) => (
              <div
                key={index}
                className="bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-xl 
                transition-all duration-300 hover:bg-white/30 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="text-sm font-medium text-slate-800 line-clamp-2 mb-2">
                  {search.content}
                </div>
                <div
                  className={`text-xs font-semibold uppercase tracking-wider ${search.result === "Real News"
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {search.result}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 italic">No recent searches</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100 transform transition-all hover:scale-105 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-8 px-6 flex items-center justify-center space-x-3">
            <Zap className="h-10 w-10 text-yellow-300 animate-pulse" />
            <h2 className="text-4xl font-bold tracking-tight">News Verifier</h2>
          </div>

          <div className="p-8 space-y-8">
            {/* Textarea with Clear Button */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                placeholder="Paste the news article here..."
                className="w-full min-h-[200px] resize-y border-2 border-blue-100 rounded-xl p-4 
                focus:ring-4 focus:ring-blue-300 focus:outline-none 
                transition-all duration-300 
                placeholder-gray-400 
                shadow-inner hover:shadow-md pr-12"
              />
              {newsContent && (
                <button
                  onClick={clearTextArea}
                  title="Clear Text"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 
                  transition-all duration-300 group"
                >
                  <XCircle className="h-6 w-6 group-hover:scale-110 group-hover:rotate-6" />
                </button>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!newsContent || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 
              hover:from-blue-700 hover:to-indigo-800 
              text-white font-bold py-3 rounded-xl 
              transition-all duration-300 
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center space-x-2
              transform hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </button>

            {/* Result Section */}
            {result && (
              <div
                className={`flex items-center space-x-4 p-6 rounded-xl shadow-md transform transition-all duration-300 ${result === "Real News"
                    ? "bg-green-50 border border-green-200 hover:shadow-lg"
                    : "bg-red-50 border border-red-200 hover:shadow-lg"
                  }`}
              >
                {result === "Real News" ? (
                  <CheckCircle2 className="h-10 w-10 text-green-600 animate-bounce" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-red-600 animate-pulse" />
                )}
                <div>
                  <div className="font-bold text-2xl">{result}</div>
                  <div className="text-sm text-gray-600">
                    {result === "Real News"
                      ? "This article appears to be genuine."
                      : "This article may contain false information."}
                  </div>
                </div>
              </div>
            )}

            {/* Error Section */}
            {error && (
              <div className="bg-red-50 border border-red-200 flex items-center space-x-4 p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-lg">
                <AlertCircle className="h-10 w-10 text-red-600 animate-pulse" />
                <div>
                  <div className="font-bold text-2xl text-red-800">Error</div>
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              </div>
            )}

            {/* Accuracy Section */}
            {accuracy !== null && (
              <div className="bg-blue-50 border border-blue-200 flex items-center space-x-4 p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-lg">
                <Zap className="h-10 w-10 text-blue-600 animate-pulse" />
                <div>
                  <div className="font-bold text-2xl text-blue-800">Model Accuracy</div>
                  <div className="text-sm text-blue-600">
                    The model has an accuracy of {(accuracy * 100).toFixed(2)}%.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;