import express from "express";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3002;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPonoe = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

const app = express();
app.use(express.json());

// send alert
app.route("/messages").post(async (req, res) => {
  try {
    // Validate the presence of required parameters
    if (!req.body.number || !req.body.message) {
      res.status(400).send("Missing required number and message");
      return;
    }
    client.messages
      .create({
        from: req.body.number.startsWith("whatsapp")
          ? `whatsapp:${twilioPonoe}`
          : twilioPonoe,
        body: req.body.message,
        to: req.body.number,
      })
      .then((message) => res.status(201).send(message));
  } catch (error) {
    console.error("error", error);
    res.status(404).send(error);
  }
});

// receive whatsapp message
app.route("/incoming").post(async (req, res) => {
  try {
    console.log("req 2", req.body);
    res.status(201).send("Msg received");
  } catch (error) {
    console.error("error", error);
    res.status(404).send(error);
  }
});

app.listen(port, () => {
  console.info(`[server]: Server is running at http://localhost:${port}`);
});
