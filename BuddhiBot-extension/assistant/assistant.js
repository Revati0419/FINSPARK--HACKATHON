document.getElementById("bb-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const input = e.target.value;
      const chat = document.getElementById("bb-chatlog");
      const userBubble = document.createElement("div");
      userBubble.textContent = "🧑: " + input;
      chat.appendChild(userBubble);
  
      const botBubble = document.createElement("div");
      botBubble.textContent = "🤖: (Response coming soon...)";
      chat.appendChild(botBubble);
  
      e.target.value = "";
    }
  });
  