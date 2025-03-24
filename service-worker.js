chrome.storage.onChanged.addListener((changes, areaName) => {
    if (changes.chooseTheme.oldValue) {
        chrome.scripting.unregisterContentScripts({
            ids: [changes.chooseTheme.oldValue],
        });
    }

    if (changes.chooseTheme.newValue) {
        const new_flomo_theme = {
            id: changes.chooseTheme.newValue,
            matches: ['https://v.flomoapp.com/*', 'https://flomoapp.com/*'],
            css: ['include/theme/' + changes.chooseTheme.newValue],
            runAt: 'document_end',
        };
        chrome.scripting.registerContentScripts([new_flomo_theme]);

        // 使新的css生效
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // 注入新的内容脚本,如果当前页面是chrome:// 则不注入
            if (tabs[0].url.indexOf('chrome://') > -1) {
                return;
            }
            console.log('注入新的css' + tabs[0].id);
            chrome.scripting.insertCSS({
                target: {
                    tabId: tabs[0].id,
                },
                files: ['include/theme/' + changes.chooseTheme.newValue],
            });
        });
    }
});

const DEFAULT_THEME = 'stackoverflow-dark.css';
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ chooseTheme: DEFAULT_THEME }, () => {
        console.log('保存成功');
    });
});

function getTheme() {
    // 获取当前主题
    chrome.storage.sync.get('chooseTheme', (result) => {
        if (result.chooseTheme) {
            console.log('当前主题为', result.chooseTheme);
            DEFAULT_THEME = result.chooseTheme;
        }
    });
    return DEFAULT_THEME;
}

const flomo_content_script = {
    id: 'flomo_content_script',
    matches: ['https://v.flomoapp.com/*', 'https://flomoapp.com/*'],
    js: ['scripts/content.js', 'include/highlight.min.js'],
    runAt: 'document_end',
};
chrome.scripting.registerContentScripts([flomo_content_script]);

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startDebugging') {
        const tabId = sender.tab.id;
        startDebugging(tabId);
    }
});

// 存储已附加调试器的标签页
const debuggedTabs = new Set();

// 启动调试器
function startDebugging(tabId) {
    // 如果已经为此标签页附加了调试器，则不重复附加
    if (debuggedTabs.has(tabId)) {
        return;
    }

    // 附加调试器
    chrome.debugger.attach({ tabId }, '1.0', () => {
        if (chrome.runtime.lastError) {
            console.error('附加调试器失败:', chrome.runtime.lastError);
            return;
        }

        debuggedTabs.add(tabId);
        console.log('已为标签页', tabId, '附加调试器');

        // 启用Runtime域，用于监听控制台消息
        chrome.debugger.sendCommand({ tabId }, 'Runtime.enable', {}, () => {
            if (chrome.runtime.lastError) {
                console.error('启用Runtime失败:', chrome.runtime.lastError);
                return;
            }
            console.log('已启用Runtime域');
        });
    });
}

// 监听调试事件
chrome.debugger.onEvent.addListener((debuggeeId, method, params) => {
    if (method === 'Runtime.consoleAPICalled') {
        const { type, args } = params;

        // 只处理console.log类型的消息
        if (type === 'log' && args && args.length > 0) {
            // 尝试从参数中提取文本
            try {
                const consoleText = args
                    .map((arg) => {
                        if (arg.value !== undefined) {
                            return String(arg.value);
                        } else if (arg.description) {
                            return arg.description;
                        } else {
                            return JSON.stringify(arg);
                        }
                    })
                    .join(' ');

                // 检查是否包含关键字"getMemos:"
                if (consoleText.includes('getMemos:')) {
                    // 向对应的content script发送消息
                    chrome.tabs.sendMessage(debuggeeId.tabId, {
                        action: 'consoleMessageDetected',
                        text: consoleText,
                    });
                    console.log('检测到getMemos，已通知content script', consoleText);
                }
            } catch (error) {
                console.error('处理控制台消息时出错:', error);
            }
        }
    }
});

// 监听标签页关闭事件，释放调试器
chrome.tabs.onRemoved.addListener((tabId) => {
    if (debuggedTabs.has(tabId)) {
        try {
            chrome.debugger.detach({ tabId });
        } catch (error) {
            // 标签页已关闭，可能会有错误，忽略即可
        }
        debuggedTabs.delete(tabId);
        console.log('已释放标签页', tabId, '的调试器');
    }
});
