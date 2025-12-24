import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Trash2, ShieldCheck, Activity } from 'lucide-react';
import './global.css';

declare global {
    interface Window {
        electronAPI: {
            获取内存数据: () => Promise<any>;
            执行大扫除: () => Promise<any>;
        };
    }
}

const App: React.FC = () => {
    const [系统状态, 设置系统状态] = useState<any>(null);
    const [正在清理, 设置正在清理] = useState(false);
    const [显示成功, 设置显示成功] = useState(false);

    useEffect(() => {
        const 获取数据 = async () => {
            const 数据 = await window.electronAPI.获取内存数据();
            if (数据) 设置系统状态(数据);
        };

        获取数据();
        const 计时器 = setInterval(获取数据, 2000);
        return () => clearInterval(计时器);
    }, []);

    const 执行一键清理 = async () => {
        设置正在清理(true);
        const 结果 = await window.electronAPI.执行大扫除();

        // 模拟清理过程感官动效，给用户心理暗示
        setTimeout(() => {
            设置正在清理(false);
            if (结果.success) {
                设置显示成功(true);
                setTimeout(() => 设置显示成功(false), 3000);
            }
        }, 2000);
    };

    if (!系统状态) return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-accent-color border-t-transparent rounded-full"
            />
            <div className="text-zinc-500 font-medium tracking-widest animate-pulse">正在监测系统状态...</div>
        </div>
    );

    return (
        <div className="p-8 flex flex-col h-full space-y-8 select-none relative overflow-hidden">
            {/* 顶部标题栏 */}
            <div className="pt-4 flex items-center justify-between z-10">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                        RAM MASTER
                    </h1>
                    <span className="text-[10px] text-accent-color font-bold tracking-[0.2em] uppercase opacity-80">Professional Edition</span>
                </div>
                <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <ShieldCheck className="text-accent-color w-7 h-7 filter drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" />
                </motion.div>
            </div>

            {/* 核心仪表盘 */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="relative w-72 h-72 flex items-center justify-center">
                    {/* 背景装饰环 */}
                    <div className="absolute inset-0 rounded-full border-[1px] border-white/5 scale-110" />
                    <div className="absolute inset-0 rounded-full border-[1px] border-white/5 scale-125 opacity-50" />
                    
                    {/* 动态圆形进度条 */}
                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--accent-color)" />
                                <stop offset="100%" stopColor="#00f2fe" />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="144"
                            cy="144"
                            r="125"
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="16"
                            fill="transparent"
                        />
                        <motion.circle
                            cx="144"
                            cy="144"
                            r="125"
                            stroke="url(#progressGradient)"
                            strokeWidth="16"
                            fill="transparent"
                            strokeDasharray="785"
                            initial={{ strokeDashoffset: 785 }}
                            animate={{ strokeDashoffset: 785 - (785 * parseFloat(系统状态.percentage)) / 100 }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* 中间数值展示 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            key={系统状态.percentage}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-baseline"
                        >
                            <span className="text-7xl font-black tracking-tighter tabular-nums">
                                {Math.round(系统状态.percentage)}
                            </span>
                            <span className="text-2xl font-bold ml-1 text-zinc-500">%</span>
                        </motion.div>
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 opacity-60">Memory Usage</span>
                    </div>

                    {/* 清理时的冲击波特效 */}
                    <AnimatePresence>
                        {正在清理 && (
                            <>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 1 }}
                                    exit={{ scale: 2, opacity: 0 }}
                                    className="absolute inset-0 rounded-full border-2 border-accent-color/30"
                                />
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.8, opacity: 0.5 }}
                                    exit={{ scale: 2.5, opacity: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute inset-0 rounded-full border-2 border-accent-color/10"
                                />
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 详细信息面板 */}
            <div className="glass-panel p-6 grid grid-cols-2 gap-8 relative z-10 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex flex-col relative">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70">Occupied</span>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-black tabular-nums">{系统状态.used}</span>
                        <span className="text-zinc-600 font-bold text-xs">GB</span>
                    </div>
                </div>
                <div className="flex flex-col items-end relative">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70">Purgeable</span>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-black text-accent-color tabular-nums">{系统状态.freeable}</span>
                        <span className="text-zinc-600 font-bold text-xs">GB</span>
                    </div>
                </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="pb-4 z-10">
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={执行一键清理}
                    disabled={正在清理}
                    className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 transition-all shimmer ${正在清理
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-white text-black glow-shadow'
                        }`}
                >
                    {正在清理 ? (
                        <Activity className="animate-spin w-6 h-6" />
                    ) : (
                        <Trash2 className="w-6 h-6" />
                    )}
                    <span className="tracking-tight">{正在清理 ? 'PURGING SYSTEM...' : 'OPTIMIZE MEMORY'}</span>
                </motion.button>

                {/* 成功提示 */}
                <AnimatePresence>
                    {显示成功 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="absolute bottom-12 left-0 right-0 text-center"
                        >
                            <span className="bg-accent-color/10 text-accent-color px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-accent-color/20 backdrop-blur-md">
                                ✨ 系统优化完成，运行环境已就绪
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 背景氛围灯 */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent-color/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
};

export default App;
