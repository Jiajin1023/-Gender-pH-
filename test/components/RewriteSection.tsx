import React, { useState } from 'react';
import type { RewriteResult, AnalyzedNoun, RewriteChange } from '../types';

interface RewriteSectionProps {
  onRewrite: (targetPh: number) => void;
  isRewriting: boolean;
  rewriteResult: RewriteResult | null;
  rewriteError: string | null;
  calculatePh: (nouns: AnalyzedNoun[]) => number | null;
}

const highlightChanges = (text: string, changes: RewriteChange[]) => {
    if (!changes || changes.length === 0) {
        return <>{text}</>;
    }
    
    const rewrittenWords = changes.map(c => c.rewrittenWord).filter(Boolean);
    if (rewrittenWords.length === 0) {
        return <>{text}</>;
    }

    const regex = new RegExp(`(${rewrittenWords.join('|')})`, 'g');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                rewrittenWords.includes(part) ? (
                    <mark key={i} className="bg-yellow-200 rounded px-1">{part}</mark>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                )
            )}
        </>
    );
};


const RewriteSection: React.FC<RewriteSectionProps> = ({ onRewrite, isRewriting, rewriteResult, rewriteError, calculatePh }) => {
    const [targetPh, setTargetPh] = useState<number>(7);

    const newPhValue = rewriteResult ? calculatePh(rewriteResult.newNouns) : null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in-delay">
            <h2 className="text-2xl font-bold text-center mb-4 text-slate-700">
                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                文章のpHを調整
            </h2>
            <div className="w-full max-w-lg mx-auto">
                <label htmlFor="ph-slider" className="block text-center text-slate-600 mb-2">
                    目標pH: <span className="font-bold text-blue-600">{targetPh.toFixed(1)}</span>
                </label>
                <input
                    id="ph-slider"
                    type="range"
                    min="1"
                    max="14"
                    step="0.1"
                    value={targetPh}
                    onChange={(e) => setTargetPh(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isRewriting}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1 (酸性)</span>
                    <span>7 (中性)</span>
                    <span>14 (アルカリ性)</span>
                </div>
            </div>
            <button
                onClick={() => onRewrite(targetPh)}
                disabled={isRewriting}
                className="mt-6 w-full max-w-xs mx-auto bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center transition-transform transform active:scale-95"
            >
                {isRewriting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AIが書き換え中...
                    </>
                ) : (
                    <>
                         <i className="fa-solid fa-pen-to-square mr-2"></i>
                        このpHに書き換える
                    </>
                )}
            </button>
            
            {isRewriting && (
                 <div className="text-center mt-6 text-slate-500">
                    <p>AIが目標のpHになるように文章を調整しています...</p>
                </div>
            )}

            {rewriteError && (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-6" role="alert">
                    <strong className="font-bold">エラー: </strong>
                    <span className="block sm:inline">{rewriteError}</span>
                </div>
            )}
            
            {rewriteResult && (
                <div className="mt-8 pt-6 border-t border-slate-200 space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-center text-slate-700">書き換え結果</h3>
                    {newPhValue !== null && (
                         <p className="text-center text-lg font-semibold">
                            新しいpH: <span className="text-teal-600">{newPhValue.toFixed(2)}</span>
                        </p>
                    )}
                    {rewriteResult.changes.length > 0 && (
                        <div className="text-center text-slate-600 bg-slate-50 p-2 rounded-md">
                            <strong>変更点: </strong>
                            {rewriteResult.changes.map(c => `「${c.originalWord}」→「${c.rewrittenWord}」`).join('、 ')}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-slate-600 mb-1">日本語</h4>
                            <p className="bg-slate-100 p-3 rounded-lg leading-relaxed">{highlightChanges(rewriteResult.rewrittenJapanese, rewriteResult.changes)}</p>
                        </div>
                         <div>
                            <h4 className="font-bold text-slate-600 mb-1">ドイツ語</h4>
                            <p className="bg-slate-100 p-3 rounded-lg leading-relaxed">{rewriteResult.rewrittenGerman}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewriteSection;