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

// 监听网络请求
chrome.webRequest.onCompleted.addListener(
    function (details) {
        // 检查请求URL是否匹配目标
        if (details.url.includes('https://h5.udrig.com/app/v1')) {
            console.log('捕获到目标请求:', details.url);

            // 获取请求所在的tab
            chrome.tabs.get(details.tabId, function (tab) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    return;
                }

                // 在请求所在的tab中执行代码高亮功能
                chrome.tabs.sendMessage(details.tabId, { action: 'highlightCode' });
            });
        }
    },
    { urls: ['https://h5.udrig.com/app/v1*'] }
);
