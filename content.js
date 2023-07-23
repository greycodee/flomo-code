window.onload = function () {
  const hljsbtn = document.createElement("button");
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("images/code.svg");
  img.style.height = "20px";
  img.style.width = "20px";
  
  hljsbtn.appendChild(img);

  // hljsbtn.innerHTML = "点击";
  hljsbtn.type = "button";
  hljsbtn.style.height = "36px";
  hljsbtn.style.width = "36px";
  hljsbtn.style.borderRadius = "36px";
  hljsbtn.style.border = "none";
  hljsbtn.style.backgroundColor = "#397354";
  hljsbtn.style.color = "#fff";
  hljsbtn.style.cursor = "pointer";
  hljsbtn.style.position = "fixed";
  hljsbtn.style.bottom = "60px";
  hljsbtn.style.right = "30px";
  hljsbtn.style.zIndex = "9999";
  hljsbtn.style.display = "flex";
  hljsbtn.style.justifyContent = "center";
  hljsbtn.style.alignItems = "center";

  hljsbtn.addEventListener("click", () => {
    const memos = document.getElementsByClassName("richText");
    const memos_array = Array.from(memos);
    memos_array.forEach((memo) => {
      let children = memo.children;
      const memo_p_array = Array.from(children);
      let languageFlag = false;
      let codeContentArr = [];
      let languageType = "";
      for (let i = 0; i < memo_p_array.length; i++) {
        if (
          memo_p_array[i].innerHTML.startsWith("```") &&
          memo_p_array[i].innerHTML.substring(3) != ""
        ) {
          languageType = "language-" + memo_p_array[i].innerHTML.substring(3);
          languageFlag = true;
          memo.removeChild(memo_p_array[i]);
          continue;
        } else if (
          memo_p_array[i].innerHTML.startsWith("```") &&
          memo_p_array[i].innerHTML.substring(3) === ""
        ) {
          // memo.removeChild(memo_p_array[i]);
          languageFlag = false;
          let pre = document.createElement("pre");
          let code = document.createElement("code");
          code.innerHTML = codeContentArr.join("\n");
          code.className = languageType;
          pre.appendChild(code);
          memo_p_array[i].innerHTML = "";
          memo_p_array[i].appendChild(pre);
          // memo.appendChild(pre);
          //清空数组
          codeContentArr = [];
          languageType = "";
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
  });
  document.body.appendChild(hljsbtn);
};
