const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const fetch = require("node-fetch");

const getResponse = async (messages) => {
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: "gpt-3.5-turbo",
    messages,
  };
  const options = {
    method: "POST",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer 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`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
  console.log(options);
  console.log(messages);
  const res = await fetch(url, options).then((res) => res.json()); //write this in try catch
  console.log(res);

  return res.choices[0].message.content.trim();
};

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "client-one",
  }),
  puppeteer: {
    headless: false,
  },
});

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("qr generated");
});

client.on("authenticated", (session) => {
  console.log("WHATSAPP WEB => Authenticated");
});

client.on("ready", async () => {
  console.log("WHATSAPP WEB => Ready");
});

client.on("auth_failure", (session) => {
  console.log("WHATSAPP WEB => Auth Failure");
});

client.on("disconnected", (reason) => {
  console.log("WHATSAPP WEB => Disconnected");
});

client.on("message", async (msg) => {
  const chat = await msg.getChat();
  chat.sendStateTyping();
  await chat.sendSeen();
  const messages = await chat.fetchMessages({
    limit: 20,
  });
  const chatgptMessages = messages.map((m) => ({
    content: m.body,
    role: m.fromMe ? "assistant" : "user",
  }));
  const response = await getResponse(chatgptMessages);
  chat.sendMessage(response);
});
