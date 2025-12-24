import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * [Mentor Note]
 * 在 macOS 中，内存管理非常智能。
 * 我们的工具通过 `vm_stat` 获取原始页数据（Pages），
 * 这里的 4096 是 macOS 默认的页面大小（Page Size）。
 * 
 * 优化：我们不再使用死板的行索引，而是通过“关键字”查找，
 * 这样即使 macOS 系统更新，只要这些术语没变，我们的软件就永远不会失效。
 */
async function 获取内存统计() {
    try {
        const { stdout } = await execAsync('vm_stat');
        
        const 解析行 = (关键字: string) => {
            const 正则 = new RegExp(`${关键字}:\\s+(\\d+)`);
            const 匹配 = stdout.match(正则);
            return 匹配 ? parseInt(匹配[1]) * 4096 : 0;
        };

        // 通过关键字精准定位内存分布
        const 联动内存 = 解析行('Pages wired down');
        const 活跃内存 = 解析行('Pages active');
        const 非活跃内存 = 解析行('Pages inactive');
        const 压缩内存 = 解析行('Pages occupied by compressor');
        const 剩余内存 = 解析行('Pages free');

        const 已用内存 = 联动内存 + 活跃内存 + 压缩内存;
        const 可释放内存 = 非活跃内存;
        
        // 获取总内存 (使用 sysctl)
        const { stdout: 总内存输出 } = await execAsync('sysctl hw.memsize');
        const 总内存 = parseInt(总内存输出.split(':')[1].trim());

        return {
            used: (已用内存 / 1024 / 1024 / 1024).toFixed(2),
            freeable: (可释放内存 / 1024 / 1024 / 1024).toFixed(2),
            total: (总内存 / 1024 / 1024 / 1024).toFixed(0),
            percentage: ((已用内存 / 总内存) * 100).toFixed(1)
        };
    } catch (错误) {
        console.error('获取内存失败:', 错误);
        return null;
    }
}

/**
 * [Mentor Note]
 * `purge` 指令是苹果官方提供的“大扫除”工具。
 * 它会强制系统清空不活跃的缓存，瞬间腾出内存。
 */
ipcMain.handle('清理内存', async () => {
    try {
        console.log('正在执行大扫除...');
        await execAsync('purge');
        return { success: true };
    } catch (错误) {
        console.error('清理失败:', 错误);
        return { success: false, error: '权限不足或执行出错' };
    }
});

ipcMain.handle('获取统计', async () => {
    return await 获取内存统计();
});

function 创建窗口() {
    const 窗口 = new BrowserWindow({
        width: 400,
        height: 600,
        titleBarStyle: 'hiddenInset', // 苹果标志性的无边库设计
        resizable: false,
        backgroundColor: '#1a1a1a', // 沉稳的深空灰
        webPreferences: {
            preload: join(__dirname, '../main/preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        窗口.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        窗口.loadFile(join(__dirname, '../renderer/dist/index.html'));
    }
}

app.whenReady().then(创建窗口);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
