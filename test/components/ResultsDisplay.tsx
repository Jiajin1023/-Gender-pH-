import React from 'react';
import type { AnalyzedNoun } from '../types';

interface ResultsDisplayProps {
  masculineNouns: AnalyzedNoun[];
  feminineNouns: AnalyzedNoun[];
  neuterNouns: AnalyzedNoun[];
  isRewritten?: boolean;
}

const NounList: React.FC<{ title: string; nouns: AnalyzedNoun[]; color: string; icon: string }> = ({ title, nouns, color, icon }) => (
    <div className={`flex-1 min-w-[280px] p-4 rounded-lg border-t-4 ${color}`}>
        <h3 className="text-xl font-bold mb-3 flex items-center">
            <i className={`fa-solid ${icon} mr-2`}></i>
            {title} ({nouns.length})
        </h3>
        {nouns.length > 0 ? (
            <ul className="space-y-2">
            {nouns.map((noun, index) => (
                <li key={index} className="flex justify-between items-baseline p-2 bg-slate-50 rounded">
                <span className="font-semibold text-slate-800">{noun.article} {noun.germanWord}</span>
                <span className="text-sm text-slate-600">{noun.japaneseTranslation}</span>
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-slate-500 text-sm">該当する名詞はありませんでした。</p>
        )}
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ masculineNouns, feminineNouns, neuterNouns, isRewritten }) => {
  const title = isRewritten ? "書き換え後の名詞リスト" : "検出された名詞リスト";
  const icon = isRewritten ? "fa-pen-ruler" : "fa-magnifying-glass-chart";

  return (
    <div>
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">
            <i className={`fa-solid ${icon} mr-2`}></i>
            {title}
        </h2>
        <div className="flex flex-wrap gap-6 justify-center">
            <NounList 
                title="男性名詞" 
                nouns={masculineNouns} 
                color="border-blue-500 bg-blue-50"
                icon="fa-mars"
            />
            <NounList 
                title="中性名詞" 
                nouns={neuterNouns} 
                color="border-green-500 bg-green-50"
                icon="fa-genderless"
            />
            <NounList 
                title="女性名詞" 
                nouns={feminineNouns} 
                color="border-pink-500 bg-pink-50"
                icon="fa-venus"
            />
        </div>
    </div>
  );
};

export default ResultsDisplay;