// const apiKey = "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"; // Replace with your actual API key
// const message = "how are you?";
// const model = "llama3-70b-8192";

export async function LLM (system_prompt, apiKey, user_prompt, model) {
    try{
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{role: "system", content: system_prompt}, { role: "user", content: user_prompt }],
                model: model
            })
        });

        const data = await response.json();
        return data['choices'][0]['message']['content'];
    }catch(error) {
        console.error("LLM Error:", error);
        return error;
    }
}