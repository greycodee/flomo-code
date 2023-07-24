// 获取选择的语言
const theme = document.querySelector("#theme");
// 保存选择的语言
theme.addEventListener("change", (e) => {
  console.log(e.target.value);
  // 获取选择的语言
  const chooseTheme = e.target.value;
  // 保存选择的语言
  chrome.storage.sync.set({ chooseTheme }, () => {
    console.log("保存成功");
  });
});

// 获取保存的语言
chrome.storage.sync.get(["chooseTheme"], (result) => {
  // 设置选择的语言
  theme.value = result.chooseTheme;
});
