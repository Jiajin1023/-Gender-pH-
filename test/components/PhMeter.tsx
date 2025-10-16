
import React from 'react';

interface PhMeterProps {
  value: number | null;
}

const getPhColor = (ph: number | null): string => {
    if (ph === null) return 'bg-slate-400';
    if (ph < 3) return 'bg-red-500';
    if (ph < 5) return 'bg-orange-500';
    if (ph < 6.5) return 'bg-yellow-500';
    if (ph <= 7.5) return 'bg-green-500';
    if (ph < 9) return 'bg-teal-500';
    if (ph < 11) return 'bg-blue-500';
    return 'bg-indigo-600';
};

const PhMeter: React.FC<PhMeterProps> = ({ value }) => {
    const position = value !== null ? ((value - 1) / 13) * 100 : 50;

    const meterText = value !== null
        ? value < 6.5 ? "男性名詞が多い (酸性)"
        : value > 7.5 ? "女性名詞が多い (アルカリ性)"
        : "バランスが取れている (中性)"
        : "分析中...";
    
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-lg">
                <div className="relative h-8 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-indigo-600 shadow-inner">
                    {value !== null && (
                        <div
                            className="absolute top-0 h-full flex items-center transition-all duration-700 ease-out"
                            style={{ left: `calc(${position}% - 16px)` }}
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-white shadow-lg border-2 border-slate-300 flex items-center justify-center">
                                    <div className={`w-4 h-4 rounded-full ${getPhColor(value)}`}></div>
                                </div>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-sm font-bold px-2 py-1 rounded">
                                    {value.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                    <span>1 (男性)</span>
                    <span>7 (中性)</span>
                    <span>14 (女性)</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <p className={`text-xl font-semibold ${getPhColor(value).replace('bg-', 'text-')}`}>
                    {value !== null ? `pH: ${value.toFixed(2)}` : "pH: -"}
                </p>
                <p className="text-slate-600">{meterText}</p>
            </div>
        </div>
    );
};

export default PhMeter;
