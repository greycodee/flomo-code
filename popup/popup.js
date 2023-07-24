 // 获取选择的语言
 const lang = document.querySelector('#lang');
 // 保存选择的语言
 lang.addEventListener('change', (e) => {
     console.log(e.target.value);
     // 获取选择的语言
     const language = e.target.value;
     // 保存选择的语言
     chrome.storage.sync.set({language}, () => {
         console.log('保存成功');
        //  chrome.scripting.insertCSS({
        //     files: ['include/theme/stackoverflow-light.css']
        //   });
     });
 });

 // 获取保存的语言
 chrome.storage.sync.get(['language'], (result) => {
     // 设置选择的语言
     lang.value = result.language;
 });
