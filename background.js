chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "selectElement") {
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            func: SelectElement,
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            sendResponse(results[0].result);
        });
        return true; // Will respond asynchronously.
    }
});

function SelectElement() {
    return new Promise((resolve) => {
        let original_style;
        let select_element;

        function mouse_over(event) {
            original_style = event.target.style.cssText;
            event.target.style.cssText = 'border:1px solid red !important;';
        }

        function mouse_out(event) {
            event.target.style.cssText = original_style;
        }

        function on_mouse_down(event) {
            select_element = event.target;
            select_element.style.cssText = original_style;
            select_element.onclick = (e) => { e.preventDefault(); };
            removeEventListener("mouseover", mouse_over);
            removeEventListener("mouseout", mouse_out);
            removeEventListener("mousedown", on_mouse_down);

            resolve(select_element.innerText);
        }

        addEventListener("mouseover", mouse_over);
        addEventListener("mouseout", mouse_out);
        addEventListener("mousedown", on_mouse_down);
    });
}