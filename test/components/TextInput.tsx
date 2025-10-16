
import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange, onAnalyze, isLoading }) => {
  return (
    <div>
      <label htmlFor="text-input" className="block text-lg font-medium text-slate-700 mb-2">
        日本語または英語でテキストを入力してください
      </label>
      <textarea
        id="text-input"
        className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        placeholder="例: 私の父は車を運転し、母は猫と遊んでいます。"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      />
      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center transition-transform transform active:scale-95"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            分析中...
          </>
        ) : (
          <>
            <i className="fa-solid fa-flask-vial mr-2"></i>
            分析する
          </>
        )}
      </button>
    </div>
  );
};

export default TextInput;
