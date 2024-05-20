function crawler(query) {
    const target_element = document.querySelector(query);
    if (target_element) {
        return target_element.innerText;
    }
}

function SelectElement() {
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
        event.preventDefault();
        select_element = event.target;
        select_element.style.cssText = original_style;
        
        // 移除事件監聽器
        document.removeEventListener("mouseover", mouse_over);
        document.removeEventListener("mouseout", mouse_out);
        document.removeEventListener("mousedown", on_mouse_down);
        
        select_element.onclick = (e) => { e.preventDefault(); };
        let selector = getQuerySelector(select_element);
        // 將選擇器存儲到 localStorage
        localStorage.setItem('selectedQuery', selector);
    }

    function getQuerySelector(element) {
        if (element.id) return `#${element.id}`;
        
        let path = [];
        while (element.parentElement) {
            let selector = element.tagName.toLowerCase();
            if (element.className) 
                selector += `.${element.className.trim().split(/\s+/).join('.')}`;
            
            let sibling = element;
            let nth = 1;
            while (sibling = sibling.previousElementSibling) {
                if (sibling.tagName.toLowerCase() == selector) 
                    nth++;
            }
            if (nth != 1) 
                selector += `:nth-of-type(${nth})`;
            
            path.unshift(selector);
            element = element.parentElement;
        }
        return path.join(" > ");
    }

    document.addEventListener("mouseover", mouse_over);
    document.addEventListener("mouseout", mouse_out);
    document.addEventListener("mousedown", on_mouse_down);
}


// function SelectElement() {
//     let original_style;
//     let select_element;

//     function mouse_over(event) {
//         original_style = event.target.style.cssText;
//         event.target.style.cssText = 'border:1px solid red !important;';
//     }

//     function mouse_out(event) {
//         event.target.style.cssText = original_style;
//     }

//     function on_mouse_down(event) {
//         select_element = event.target;
//         select_element.style.cssText = original_style;
//         select_element.onclick = (e) => { e.preventDefault(); };
//         removeEventListener("mouseover", mouse_over);
//         removeEventListener("mouseout", mouse_out);
//         removeEventListener("mousedown", on_mouse_down);

//         console.log(event.target.query);
//     }

//     addEventListener("mouseover", mouse_over);
//     addEventListener("mouseout", mouse_out);
//     addEventListener("mousedown", on_mouse_down);
// }


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("get_request:". request);
    if(request.task === "get_reference_data"){
        const result = crawler(request.data);
        sendResponse({result});
    }else if(request.task === "select_element"){
        SelectElement();
    }
    return true;
});