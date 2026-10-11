const axios = require("axios");

const app = express();
app.use(express.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Verify the Messenger webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive Messenger messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    for (const entry of req.body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        const message = event.message?.text?.trim();

        if (!senderId || !message) continue;

        if (message.toLowerCase().startsWith("!anigif")) {
          await sendGif(senderId);
        }
      }
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
  }
});

// Send an animated GIF
async function sendGif(senderId) {
  const gifUrl = "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif";

  await axios.post(
    "https://graph.facebook.com/vXX.X/me/messages",
    {
      recipient: { id: senderId },
      message: {
        attachment: {
          type: "image",
          payload: {
            url: gifUrl,
            is_reusable: true
          }
        }
      }
    },
    {
      params: {
        access_token: PAGE_ACCESS_TOKEN
      }
    }
  );
}app.listen(process.env.PORT || 3000, () => {
  console.log("Messenger bot is running");
});
