// Example of a simple user data object
const user = {
  username: "demo-user",
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  console.log(message);
  refresh();
  if (message === "get-user-data") {
    sendResponse(user);
  }
});

// // 异步执行，每5s发消息
// setInterval(() => {
//   chrome.runtime.sendMessage("refresh", (response) => {
//     // alert(response.username);
//     console.log(response.username);
//     // initializeUI(response);
//   });
// }, 5000);


async function refresh(){
    console.log("refresh");
    let count = 1;
    setTimeout(() => {
        console.log(count++);
        // chrome.runtime.sendMessage("refresh", (response) => {
        //     // alert(response.username);
        //     // console.log(response);
        //     // initializeUI(response);
        // });
    }, 1000);
}

