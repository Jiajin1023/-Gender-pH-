import { GoogleGenAI, Type } from "@google/genai";
import type { AnalyzedNoun, RewriteResult, AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        germanTranslation: {
            type: Type.STRING,
            description: 'The full German translation of the original text.',
        },
        nouns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                germanWord: {
                  type: Type.STRING,
                  description: 'The noun in German, singular form.',
                },
                article: {
                  type: Type.STRING,
                  description: "The definite article ('der', 'die', or 'das').",
                },
                japaneseTranslation: {
                  type: Type.STRING,
                  description: 'The Japanese meaning of the noun.',
                },
              },
              required: ["germanWord", "article", "japaneseTranslation"],
            },
        }
    },
    required: ["germanTranslation", "nouns"],
};


export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  const prompt = `
    以下のテキストを分析してください。

    手順:
    1. テキストをドイツ語に翻訳します。
    2. 翻訳されたドイツ語の文章から、すべての名詞を特定します。
    3. 各名詞について、その性（男性、女性、中性）を示す定冠詞（der, die, das）を判断します。
    4. 各名詞の日本語訳を提供します。
    5. 結果を、'germanTranslation' (翻訳されたドイツ語全文) と 'nouns' (名詞のJSON配列) をキーに持つJSONオブジェクトとしてフォーマットします。

    テキスト: "${text}"
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedResult = JSON.parse(jsonString);

    // Filter out any invalid entries to ensure type safety
    const validNouns: AnalyzedNoun[] = (parsedResult.nouns || []).filter(
        (item: any): item is AnalyzedNoun => 
        typeof item.germanWord === 'string' &&
        (item.article === 'der' || item.article === 'die' || item.article === 'das') &&
        typeof item.japaneseTranslation === 'string'
    );

    const result: AnalysisResult = {
        germanTranslation: parsedResult.germanTranslation || '',
        nouns: validNouns,
    };
    
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze text with Gemini API.");
  }
};

const rewriteSchema = {
  type: Type.OBJECT,
  properties: {
    rewrittenJapanese: {
      type: Type.STRING,
      description: 'The rewritten Japanese text.',
    },
    rewrittenGerman: {
      type: Type.STRING,
      description: 'The German translation of the rewritten text.',
    },
    changes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          originalWord: { type: Type.STRING, description: 'The original Japanese noun that was replaced.' },
          rewrittenWord: { type: Type.STRING, description: 'The new Japanese noun used as a replacement.' },
        },
        required: ['originalWord', 'rewrittenWord'],
      },
    },
    newNouns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          germanWord: { type: Type.STRING },
          article: { type: Type.STRING },
          japaneseTranslation: { type: Type.STRING },
        },
        required: ["germanWord", "article", "japaneseTranslation"],
      },
    },
  },
  required: ['rewrittenJapanese', 'rewrittenGerman', 'changes', 'newNouns'],
};

export const rewriteTextForPh = async (
  originalText: string,
  currentNouns: AnalyzedNoun[],
  targetPh: number
): Promise<RewriteResult> => {
  const prompt = `
    あなたは、日本語とドイツ語の専門家で、創造的な文章書き換えアシスタントです。
    あなたの仕事は、与えられた日本語の文章を書き換えて、そのドイツ語訳に含まれる名詞の「ジェンダーpH」が目標値に近づくようにすることです。

    ジェンダーpHの定義:
    - 男声名詞 (der) は酸性 (pH 1に近い)
    - 女性名詞 (die) はアルカリ性 (pH 14に近い)
    - 中性名詞 (das) は中性 (pH 7に近づける効果)
    - pHは、男性名詞と女性名詞の比率で主に決まります。男性100%ならpH 1、女性100%ならpH 14です。

    実行手順:
    1. 以下の「元の日本語テキスト」と、そのテキストに含まれる「現在のドイツ語名詞リスト」を理解します。
    2. 「目標pH」の値を確認します。
    3. 元の文章の文脈や意味をできるだけ保ちながら、名詞を他の名詞に置き換えることで、ドイツ語訳のジェンダーpHが「目標pH」に近づくように、元の日本語テキストを書き換えます。
        - pHを下げたい（酸性にしたい）場合：女性名詞や中性名詞を、文脈に合う男性名詞に置き換えます。
        - pHを上げたい（アルカリ性にしたい）場合：男性名詞や中性名詞を、文脈に合う女性名詞に置き換えます。
    4. 最終的に生成した「書き換え後の日本語テキスト」と、その「ドイツ語訳」、行った「変更点のリスト」、そして「新しいドイツ語名詞リスト」をJSON形式で出力してください。

    元の日本語テキスト: "${originalText}"
    現在のドイツ語名詞リスト: ${JSON.stringify(currentNouns)}
    目標pH: ${targetPh}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: rewriteSchema,
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as RewriteResult;
  } catch (error) {
    console.error("Error calling Gemini API for rewriting:", error);
    throw new Error("Failed to rewrite text with Gemini API.");
  }
};