const assistantHtml = chrome.runtime.getURL("assistant/assistant.html");

fetch(assistantHtml)
  .then(res => res.text())
  .then(data => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = data;
    document.body.appendChild(wrapper);

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = chrome.runtime.getURL("assistant/assistant.css");
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("assistant/assistant.js");
    document.body.appendChild(script);
  });
