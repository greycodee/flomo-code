window.onload = function () {
    const hljsbtn = document.createElement('button');
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('images/code.svg');
    img.style.height = '20px';
    img.style.width = '20px';

    hljsbtn.appendChild(img);

    // hljsbtn.innerHTML = "点击";
    hljsbtn.type = 'button';
    hljsbtn.style.height = '36px';
    hljsbtn.style.width = '36px';
    hljsbtn.style.borderRadius = '36px';
    hljsbtn.style.border = 'none';
    hljsbtn.style.backgroundColor = '#397354';
    hljsbtn.style.color = '#fff';
    hljsbtn.style.cursor = 'pointer';
    hljsbtn.style.position = 'fixed';
    hljsbtn.style.bottom = '80px';
    hljsbtn.style.right = '30px';
    hljsbtn.style.zIndex = '9999';
    hljsbtn.style.display = 'flex';
    hljsbtn.style.justifyContent = 'center';
    hljsbtn.style.alignItems = 'center';

    hljsbtn.addEventListener('click', highlightCodeBlocks);

    document.body.appendChild(hljsbtn);
};

// 添加消息监听器
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'highlightCode') {
        highlightCodeBlocks();
        sendResponse({ status: '高亮处理完成' });
    }
    return true; // 表示会异步发送响应
});

// 将代码高亮功能抽取为单独的函数
function highlightCodeBlocks() {
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
            } else if (memo_p_array[i].innerHTML.startsWith('```') && memo_p_array[i].innerHTML.substring(3) === '') {
                // memo.removeChild(memo_p_array[i]);
                languageFlag = false;

                // 保存代码内容的副本用于复制功能
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

                    // 创建临时元素解码HTML
                    const tempElement = document.createElement('div');

                    // 处理内容
                    let decodedContent = [];
                    for (let i = 0; i < codeForCopy.length; i++) {
                        tempElement.innerHTML = codeForCopy[i];
                        decodedContent.push(tempElement.textContent || tempElement.innerText);
                    }

                    // 最终复制内容
                    const codeText = decodedContent.join('\n');

                    // 复制到剪贴板
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
                // memo.appendChild(pre);
                //清空数组
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
    hljs.highlightAll();
}
