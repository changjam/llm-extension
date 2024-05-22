export async function executeScript(tabID, func, args) {
   chrome.scripting.executeScript({
      target: { tabId: tabID },
      func: func,
      args: args
   })
}

export async function sendMessageToTabs(task_name, data = "") {
   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
   return await chrome.tabs.sendMessage(tab.id, {task: task_name, data: data});
}

export async function sendMessageToBG(task_name, data){
   return await chrome.runtime.sendMessage({ task: task_name, data: data})
}