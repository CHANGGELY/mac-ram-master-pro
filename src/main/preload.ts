import { contextBridge, ipcRenderer } from 'electron';

/**
 * [Mentor Note]
 * 为了保证安全，我们不直接在网页里运行系统命令。
 * 我们搭建了一座“桥梁” (ContextBridge)，只允许网页发送特定的指令（获取统计、清理内存）。
 * 这样即便是网页被攻击，黑客也无法控制你的电脑。
 */
contextBridge.exposeInMainWorld('electronAPI', {
    获取内存数据: () => ipcRenderer.invoke('获取统计'),
    执行大扫除: () => ipcRenderer.invoke('清理内存')
});
