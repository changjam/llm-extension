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
const select_query_input = document.getElementById("select_query_input");
const element_selector = document.getElementById("element_selector");

// response
const responseContent = document.getElementById("response_content");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const ClearBtn = document.getElementById("ClearBtn");


let isSettingOpen = false;
openSettingBtn.addEventListener("click", () => {
    let display = isSettingOpen ? "none" : "flex";
    isSettingOpen = !isSettingOpen;
    setting.style.display = display;
})

element_selector.addEventListener("click", async ()=>{
    await sendMessageToTabs("select_element");
});

// generate response
sendMessageBtn.addEventListener("click", async () => {
    console.log('1')
    const search_query = select_query_input.value;
    if (search_query === "" || search_query === null) {
        responseContent.innerText = "Error: 請輸入查詢條件";
        return;
    }
    console.log('2')
    
    const response = await sendMessageToTabs("get_reference_data", search_query);
    const reference_data = response["result"];
    if (reference_data === "" || reference_data === null){
        responseContent.innerText = "Error: 查詢不到相關資料";
        return;
    }
    console.log('3')
    
    const user_question = messageInput.value;
    if (user_question === "" || user_question === null)
        return;
    console.log('4')
    const user_prompt = "請參考給你的資料，回答以下問題:\n" + user_question + "\n\n參考資料:\n" + reference_data;
    const model_response = await LLM(system_prompt_input.value, api_key_input.value, user_prompt, model_name_input.value);
    responseContent.innerText = model_response;
    chrome.storage.sync.set({ model_response });
});

ClearBtn.addEventListener("click", (e)=>{
    responseContent.innerText = "";
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
    responseContent.innerText = model_response || "";
    api_key_input.value = api_key || "";
    system_prompt_input.value = system_prompt || "你是一個只會說中文的語言模型，回答請使用中文。";
    model_name_input.value = model_name || "llama3-70b-8192";
}

window.onload = () => {
    fetchData();
}