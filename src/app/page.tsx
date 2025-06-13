"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
// 移除了未使用的 clsx 和 tailwind-merge 导入
// import { type ClassValue, clsx } from 'clsx';
// import { twMerge } from 'tailwind-merge';

// --- 移除了未使用的 cn 函数 ---

// --- 图标组件 ---
function ArrowLeftRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" />
      <path d="M20 17H4" />
    </svg>
  );
}


// --- 汇率计算器组件 ---

// 定义支持的货币类型
type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'CNY' | 'KRW' | 'SGD';

// 货币详细信息
const currencies: { code: Currency; name: string; symbol: string }[] = [
    { code: 'CNY', name: '人民币', symbol: '¥' },
    { code: 'SGD', name: '新加坡元', symbol: 'S$' },
    { code: 'JPY', name: '日元', symbol: '¥' },
    { code: 'KRW', name: '韩元', symbol: '₩' },
    { code: 'USD', name: '美元', symbol: '$' },
    { code: 'GBP', name: '英镑', symbol: '£' },
    { code: 'EUR', name: '欧元', symbol: '€' },
    { code: 'AUD', name: '澳元', symbol: 'A$' },
];

function CurrencyConverter() {
    const [amount1, setAmount1] = useState<number | string>(1);
    const [amount2, setAmount2] = useState<number | string>('');
    const [currency1, setCurrency1] = useState<Currency>('USD');
    const [currency2, setCurrency2] = useState<Currency>('CNY');
    const [rates, setRates] = useState<{ [key: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // 获取汇率的函数
    const fetchRates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 使用一个免费的公共API获取实时汇率，以USD为基准
            const response = await fetch(`https://open.exchangerate-api.com/v6/latest/USD`);
            if (!response.ok) {
                throw new Error('网络响应失败，无法获取最新汇率。');
            }
            const data = await response.json();
             if (data.result === 'error') {
                throw new Error(data['error-type'] || '获取汇率数据时发生未知错误。');
            }
            setRates(data.rates);
            setLastUpdated(new Date(data.time_last_update_unix * 1000).toLocaleString());
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载汇率失败');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 组件加载时获取汇率
    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    // 计算转换后的金额
    const calculateConvertedAmount = useCallback(() => {
        if (Object.keys(rates).length === 0) return;
        
        const rate1 = rates[currency1];
        const rate2 = rates[currency2];

        if (rate1 && rate2) {
            const value1 = typeof amount1 === 'string' ? parseFloat(amount1) : amount1;
            if(!isNaN(value1)) {
                 const result = (value1 / rate1) * rate2;
                 setAmount2(result.toFixed(4));
            }
        }
    }, [amount1, currency1, currency2, rates]);
    
    useEffect(() => {
        calculateConvertedAmount();
    }, [calculateConvertedAmount]);


    const handleAmount1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount1(value);
        if (value === '' || isNaN(parseFloat(value))) {
            setAmount2('');
            return;
        }
    };
    
    const handleAmount2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount2(value);
         if (value === '' || isNaN(parseFloat(value))) {
            setAmount1('');
            return;
        }
        
        const rate1 = rates[currency1];
        const rate2 = rates[currency2];

        if(rate1 && rate2) {
            const numValue = parseFloat(value);
            const result = (numValue / rate2) * rate1;
            setAmount1(result.toFixed(4));
        }
    };

    const handleSwapCurrencies = () => {
        setCurrency1(currency2);
        setCurrency2(currency1);
        // Swap amounts as well
        setAmount1(amount2);
        setAmount2(amount1);
    };
    
    const singleRate = rates[currency2] / rates[currency1];

    return (
        <div className="w-full max-w-lg mx-auto mt-8 sm:mt-12 p-4 sm:p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">实时汇率计算器</h2>
            
            {isLoading && <div className="text-center text-gray-500">正在加载最新汇率...</div>}
            {error && <div className="text-center text-red-500 bg-red-100 p-2 rounded-lg">{error}</div>}

            {!isLoading && !error && (
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CurrencyInput value={amount1} onValueChange={handleAmount1Change} currency={currency1} onCurrencyChange={setCurrency1} />
                        <CurrencyInput value={amount2} onValueChange={handleAmount2Change} currency={currency2} onCurrencyChange={setCurrency2} />
                    </div>

                    <div className="flex items-center justify-center my-4">
                        <button onClick={handleSwapCurrencies} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-transform duration-300 hover:rotate-180">
                            <ArrowLeftRightIcon className="w-5 h-5 text-gray-600"/>
                        </button>
                    </div>

                     <div className="text-center bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-1">当前汇率</p>
                        <p className="text-lg font-bold text-gray-800">
                           1 {currency1} ≈ {singleRate.toFixed(4)} {currency2}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">最后更新: {lastUpdated}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// 货币输入子组件
interface CurrencyInputProps {
    value: number | string;
    onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currency: Currency;
    onCurrencyChange: (c: Currency) => void;
}

function CurrencyInput({ value, onValueChange, currency, onCurrencyChange }: CurrencyInputProps) {
    return (
        <div className="relative">
            <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="w-full px-4 py-2 mb-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800"
            >
                {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
            </select>
            <input
                type="number"
                value={value}
                onChange={onValueChange}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-all placeholder-gray-400 text-gray-800"
            />
        </div>
    );
}


// --- 核心背景动画组件 ---
function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path, index) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={0.5 + index * 0.03}
                        strokeOpacity={0.1 + index * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

// --- Apex主页组件 ---
function ApexHero({ title = "Apex" }: { title?: string }) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white py-8 sm:py-12">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay: wordIndex * 0.1 + letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>
                </motion.div>
                
                <CurrencyConverter />
            </div>
        </div>
    );
}

// --- 页面主入口 (符合 Next.js App Router 规范) ---
export default function Page() {
    return <ApexHero title="Apex" />;
}
