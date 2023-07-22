
window.onload = function(){


const hljsbtn = document.createElement('button');
hljsbtn.innerHTML = '点击';
hljsbtn.type = "button";
hljsbtn.backgroundColor = 'red';
hljsbtn.style.height = '20px';
hljsbtn.style.width = '40px';
// hljsbtn.style.position = 'fixed';
// hljsbtn.style.top = '100px';
// hljsbtn.style.left = '10';

hljsbtn.addEventListener('click', ()=>{

    const memos = document.getElementsByClassName('richText');
    const memos_array = Array.from(memos);
    console.log(memos_array.length);
    memos_array.forEach((memo)=>{
    
        const memo_p = memo.getElementsByTagName('p');
        const memo_p_array = Array.from(memo_p);

        const newRichText = document.createElement('div');
        let languageFlag = false;
        
        let codeArr = [];
        let languageType = '';
        for (let i = 0; i < memo_p_array.length; i++){
            if (memo_p_array[i].innerHTML.startsWith('```') && memo_p_array[i].innerHTML.substring(3) != ''){
                languageFlag = true;
                let language = memo_p_array[i].innerHTML.substring(3);
                languageType = "language-"+language;
                continue;
            }else if (memo_p_array[i].innerHTML.startsWith('```') && memo_p_array[i].innerHTML.substring(3) === ''){
                languageFlag = false;
                
                let pre = document.createElement('pre');
                let code = document.createElement('code');
                code.innerHTML = codeArr.join('\n');
                code.className = languageType;
                pre.appendChild(code);
                newRichText.appendChild(pre);
                //清空数组
                codeArr = [];
                languageType = '';
                continue;
            }
            
            if (languageFlag){
                // code.innerHTML = code.innerHTML + memo_p_array[i].innerHTML;
                codeArr.push(memo_p_array[i].innerHTML);
            }else{
                let newP = document.createElement('p');
                newP.innerHTML = memo_p_array[i].innerHTML;
                newRichText.appendChild(newP);
            }
        }
        memo.innerHTML = newRichText.innerHTML;
    });
    hljs.highlightAll();
});


document.body.appendChild(hljsbtn);

// const el_container = document.getElementsByClassName('el-container').contentWindow;
const memos = document.getElementsByClassName("memos")[0];
memos.appendChild(hljsbtn);
// const sidebar_li = document.createElement('li');
// sidebar_li.innerHTML = 'hljs';
// sidebar.appendChild(sidebar_li)


// hljs.highlightAll();
};