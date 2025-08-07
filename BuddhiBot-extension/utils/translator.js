async function translateToHindi(text) {
    const response = await fetch("https://api-inference.huggingface.co/models/AI4Bharat/indictrans2-en-hi", {
      method: "POST",
      headers: {
        "Authorization": "Bearer YOUR_HUGGINGFACE_API_KEY", // Use temp key or test mode
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    });
    const data = await response.json();
    return data[0].translation_text;
  }
  