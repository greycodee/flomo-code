chrome.storage.onChanged.addListener((changes, areaName) => {
    if (changes.chooseTheme.oldValue) {
        chrome.scripting.unregisterContentScripts({
            ids: [changes.chooseTheme.oldValue],
        });
    }

    if (changes.chooseTheme.newValue) {
        const new_flomo_theme = {
            id: changes.chooseTheme.newValue,
            matches: ['https://v.flomoapp.com/*', 'https://flomoapp.com/*', 'https://h5.udrig.com/*'],
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
    matches: ['https://v.flomoapp.com/*', 'https://flomoapp.com/*', 'https://h5.udrig.com/*'],
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
                chrome.tabs.sendMessage(details.tabId, { action: 'highlightCode' }, function (response) {
                    if (chrome.runtime.lastError) {
                        console.error('发送消息错误:', chrome.runtime.lastError.message);

                        // 如果发送消息失败，可能是content script还没有加载，尝试执行代码
                        chrome.scripting.executeScript({
                            target: { tabId: details.tabId },
                            function: triggerHighlight,
                        });
                    } else {
                        console.log('已触发代码高亮');
                    }
                });
            });
        }
    },
    { urls: ['https://h5.udrig.com/app/v1*'] }
);

// 用于执行的函数
function triggerHighlight() {
    // 这个函数会在目标页面中执行
    console.log('正在执行代码高亮');
    if (window.onload) {
        // 手动触发window.onload中定义的高亮函数
        const memos = document.getElementsByClassName('richText');
        const memos_array = Array.from(memos);
        memos_array.forEach((memo) => {
            let children = memo.children;
            const memo_p_array = Array.from(children);
            let languageFlag = false;
            let codeContentArr = [];
            let languageType = '';
            for (let i = 0; i < memo_p_array.length; i++) {
                if (memo_p_array[i].innerHTML.startsWith('```') && memo_p_array[i].innerHTML.substring(3) != '') {
                    languageType = 'language-' + memo_p_array[i].innerHTML.substring(3);
                    languageFlag = true;
                    memo.removeChild(memo_p_array[i]);
                    continue;
                } else if (
                    memo_p_array[i].innerHTML.startsWith('```') &&
                    memo_p_array[i].innerHTML.substring(3) === ''
                ) {
                    languageFlag = false;

                    const codeForCopy = [...codeContentArr];

                    let pre = document.createElement('pre');
                    let code = document.createElement('code');
                    code.innerHTML = codeContentArr.join('\n');
                    code.className = languageType;

                    let wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';

                    // 创建复制按钮
                    let copyBtn = document.createElement('button');
                    copyBtn.innerHTML =
                        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                    copyBtn.style.position = 'absolute';
                    copyBtn.style.top = '5px';
                    copyBtn.style.right = '5px';
                    copyBtn.style.zIndex = '100';
                    copyBtn.style.fontSize = '12px';
                    copyBtn.style.padding = '4px';
                    copyBtn.style.background = 'rgba(240, 240, 240, 0.8)';
                    copyBtn.style.border = '1px solid #ccc';
                    copyBtn.style.borderRadius = '3px';
                    copyBtn.style.cursor = 'pointer';
                    copyBtn.style.display = 'flex';
                    copyBtn.style.justifyContent = 'center';
                    copyBtn.style.alignItems = 'center';
                    copyBtn.title = '复制代码';

                    copyBtn.addEventListener('click', function (e) {
                        e.stopPropagation();

                        const tempElement = document.createElement('div');

                        let decodedContent = [];
                        for (let i = 0; i < codeForCopy.length; i++) {
                            tempElement.innerHTML = codeForCopy[i];
                            decodedContent.push(tempElement.textContent || tempElement.innerText);
                        }

                        const codeText = decodedContent.join('\n');

                        navigator.clipboard
                            .writeText(codeText)
                            .then(() => {
                                copyBtn.style.color = '#4CAF50';
                                copyBtn.title = '已复制!';

                                setTimeout(() => {
                                    copyBtn.style.color = '';
                                    copyBtn.title = '复制代码';
                                }, 1500);
                            })
                            .catch((err) => {
                                console.error('复制失败:', err);
                            });
                    });

                    pre.appendChild(code);
                    wrapper.appendChild(pre);
                    wrapper.appendChild(copyBtn);

                    memo_p_array[i].innerHTML = '';
                    memo_p_array[i].appendChild(wrapper);

                    codeContentArr = [];
                    languageType = '';
                    continue;
                } else {
                    if (languageFlag) {
                        codeContentArr.push(memo_p_array[i].innerHTML);
                        memo.removeChild(memo_p_array[i]);
                    }
                }
            }
        });
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
    }
}
