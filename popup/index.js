import { LLM } from "./tools/LLM.js";
import { sendMessageToTabs } from "./tools/chrome_functions.js";


// setting
const openSettingBtn = document.getElementById("openSettingBtn");
const setting = document.getElementById("setting");
const api_key_input = document.getElementById("api_key_input");
const system_prompt_input = document.getElementById("system_prompt_input");
const model_name_input = document.getElementById("model_name_input");

// select element
const select_content = document.getElementById("select_content");
const searchBtn = document.getElementById("searchBtn");
const select_query_input = document.getElementById("select_query_input");
const elementSelectorBtn = document.getElementById("elementSelectorBtn");
const clearSelectorBtn = document.getElementById("clearSelectorBtn");

// response
const responseContent = document.getElementById("response_content");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");


let isSettingOpen = false;
openSettingBtn.addEventListener("click", () => {
    let display = isSettingOpen ? "none" : "flex";
    isSettingOpen = !isSettingOpen;
    setting.style.display = display;
})

searchBtn.addEventListener("click", async ()=>{
    const search_query = select_query_input.value;
    if (search_query === "" || search_query === null) {
        select_content.textContent = "請輸入查詢條件";
        return;
    }
    const response = await sendMessageToTabs("search_element", search_query);
    if (response === "" || response === null){
        select_content.textContent = "查詢不到相關資料";
        return;
    }
    select_content.textContent = response["result"];
});

elementSelectorBtn.addEventListener("click", async ()=>{
    await sendMessageToTabs("select_element");
});

clearSelectorBtn.addEventListener("click", async ()=>{
    select_query_input.value = "";
    select_content.textContent = "";
    await sendMessageToTabs("clear_local_storage_data", "selectedQuery");
});

// generate response
sendMessageBtn.addEventListener("click", async () => {
    responseContent.textContent = "\nGenerating response...\n\n";
    const search_query = select_query_input.value;
    
    if (search_query === "" || search_query === null) {
        responseContent.textContent = "Error: 請輸入查詢條件";
        return;
    }
    
    const response = await sendMessageToTabs("get_reference_data", search_query);
    const reference_data = response["result"];
    if (reference_data === "" || reference_data === null){
        responseContent.textContent = "Error: 查詢不到相關資料";
        return;
    }
    
    const user_question = messageInput.value;
    if (user_question === "" || user_question === null)
        return;

    const user_prompt = "請參考給你的資料，回答以下問題:\n" + user_question + "\n\n參考資料:\n" + reference_data;
    const model_response = await LLM(system_prompt_input.value, api_key_input.value, user_prompt, model_name_input.value);
    responseContent.textContent = model_response;
    chrome.storage.sync.set({ model_response });
});

copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(responseContent.textContent);
    
    const origin_content = copyBtn.textContent;

    copyBtn.textContent = '✅ Copied';
    copyBtn.setAttribute('disabled', '');

    setTimeout(() => {
        copyBtn.textContent = origin_content
        copyBtn.removeAttribute('disabled');
    }, 1000);
});

clearBtn.addEventListener("click", (e)=>{
    responseContent.textContent = "";
    messageInput.value = "";
    chrome.storage.sync.set({ msgInput: "" });
    chrome.storage.sync.set({ model_response: "" });
})

// set input data to chrome storage
messageInput.addEventListener("input", (e) => {
    const { value } = e.currentTarget;
    chrome.storage.sync.set({ msgInput: value });
})

select_query_input.addEventListener("input", (e) => {
    const { value } = e.currentTarget;
    chrome.storage.sync.set({ selectedQuery: value });
})

api_key_input.addEventListener("input", (e) => {
    const { value } = e.currentTarget;
    chrome.storage.sync.set({ api_key: value });
})
system_prompt_input.addEventListener("input", (e) => {
    const { value } = e.currentTarget;
    chrome.storage.sync.set({ system_prompt: value });
})
model_name_input.addEventListener("input", (e) => {
    const { value } = e.currentTarget;
    chrome.storage.sync.set({ model_name: value });
})





// get input data from chrome storage
async function fetchData() {
    let { selectedQuery, msgInput, model_response, api_key, system_prompt, model_name } = await chrome.storage.sync.get(["selectedQuery", "msgInput", "model_response", "api_key", "system_prompt", "model_name"]);
    
    select_query_input.value = selectedQuery || "body";
    messageInput.value = msgInput || "給我這篇文章的摘要";
    responseContent.textContent = model_response || "";
    api_key_input.value = api_key || "";
    system_prompt_input.value = system_prompt || "你是一個只會說中文的語言模型，回答請使用中文。";
    model_name_input.value = model_name || "llama3-70b-8192";
}

async function getLocalStorageData() {
    let result = await sendMessageToTabs("get_local_storage_data", "selectedQuery");
    select_query_input.value = result || select_query_input.value;

    if (select_query_input.value === "" || select_query_input.value === null) {
        select_content.textContent = "請輸入查詢條件";
        return;
    }
    
    const response = await sendMessageToTabs("get_reference_data", select_query_input.value);
    const reference_data = response["result"];
    if (reference_data === "" || reference_data === null){
        select_content.textContent = "查詢不到相關資料";
        return;
    }
    select_content.textContent = reference_data;
}

window.onload = async () => {
    fetchData();
    getLocalStorageData();
}
