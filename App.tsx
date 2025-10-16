import React, { useState, useCallback, useMemo } from 'react';
import type { AnalyzedNoun, RewriteResult, AnalysisResult } from './types';
import { analyzeText, rewriteTextForPh } from './services/geminiService';
import Header from './components/Header';
import TextInput from './components/TextInput';
import PhMeter from './components/PhMeter';
import ResultsDisplay from './components/ResultsDisplay';
import Loader from './components/Loader';
import RewriteSection from './components/RewriteSection';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [phValue, setPhValue] = useState<number | null>(null);

  // New state for rewriting
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);


  const calculatePh = (nouns: AnalyzedNoun[]): number | null => {
    if (!nouns || nouns.length === 0) {
      return null;
    }

    const masculineCount = nouns.filter(n => n.article === 'der').length;
    const feminineCount = nouns.filter(n => n.article === 'die').length;
    const neuterCount = nouns.filter(n => n.article === 'das').length;

    const totalCount = nouns.length;
    const genderedCount = masculineCount + feminineCount;

    if (totalCount === 0) {
        return null;
    }

    if (genderedCount === 0) {
      return 7; // All neuter, perfectly neutral
    }

    const feminineRatio = feminineCount / genderedCount;
    const rawPh = 1 + 13 * feminineRatio;

    const genderedRatio = genderedCount / totalCount;
    const finalPh = 7 + (rawPh - 7) * genderedRatio;

    return finalPh;
  };

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) {
      setError('分析するテキストを入力してください。');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setPhValue(null);
    setRewriteResult(null); // Reset rewrite result
    setRewriteError(null); // Reset rewrite error

    try {
      const result = await analyzeText(inputText);
      setAnalysisResult(result);
      const calculatedPh = calculatePh(result.nouns);
      setPhValue(calculatedPh);
    } catch (err) {
      console.error(err);
      setError('分析中にエラーが発生しました。しばらくしてからもう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  // New handler for rewriting
  const handleRewrite = useCallback(async (targetPh: number) => {
    if (!analysisResult?.nouns) return;
    
    setIsRewriting(true);
    setRewriteError(null);
    setRewriteResult(null);

    try {
      const result = await rewriteTextForPh(inputText, analysisResult.nouns, targetPh);
      setRewriteResult(result);
    } catch (err) {
      console.error(err);
      setRewriteError('書き換え中にエラーが発生しました。');
    } finally {
      setIsRewriting(false);
    }
  }, [inputText, analysisResult]);

  // Determine which nouns to display: rewritten ones if available, otherwise original ones.
  const nounsForDisplay = useMemo(() => {
    return rewriteResult?.newNouns ?? analysisResult?.nouns;
  }, [analysisResult, rewriteResult]);

  const categorizedNouns = useMemo(() => {
    if (!nounsForDisplay) {
      return { masculine: [], feminine: [], neuter: [] };
    }
    return {
      masculine: nounsForDisplay.filter(n => n.article === 'der'),
      feminine: nounsForDisplay.filter(n => n.article === 'die'),
      neuter: nounsForDisplay.filter(n => n.article === 'das'),
    };
  }, [nounsForDisplay]);


  return (
    <div className="min-h-screen font-sans antialiased">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <TextInput
            value={inputText}
            onChange={setInputText}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        {isLoading && <Loader />}
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-6" role="alert">
                <strong className="font-bold">エラー: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {analysisResult !== null && (
          <div className="mt-8 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in">
              <h2 className="text-2xl font-bold text-center mb-4 text-slate-700">分析結果</h2>
              
              <div className="mb-6">
                <h3 className="font-bold text-slate-600 mb-2 text-center text-lg">
                  <i className="fa-solid fa-language mr-2"></i>
                  ドイツ語訳
                </h3>
                <p className="bg-slate-100 p-4 rounded-lg leading-relaxed text-center text-xl font-serif">{analysisResult.germanTranslation}</p>
              </div>

              <PhMeter value={phValue} />
            </div>

            <RewriteSection 
              onRewrite={handleRewrite}
              isRewriting={isRewriting}
              rewriteResult={rewriteResult}
              rewriteError={rewriteError}
              calculatePh={calculatePh}
            />

            <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in-delay">
              <ResultsDisplay
                masculineNouns={categorizedNouns.masculine}
                feminineNouns={categorizedNouns.feminine}
                neuterNouns={categorizedNouns.neuter}
                isRewritten={!!rewriteResult}
              />
            </div>
          </div>
        )}

        {analysisResult === null && !isLoading && !error && (
            <div className="text-center mt-12 text-slate-500">
                <i className="fa-solid fa-flask text-4xl mb-4"></i>
                <p>テキストを入力して「分析する」ボタンを押し、ドイツ語の名詞のジェンダーバランスを確認しましょう！</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;