import express from "express";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3002;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const app = express();
app.use(express.json());

// send alert
app.route("/messages").post(async (req, res) => {
  try {
    client.messages
      .create({
        from: "whatsapp:+14155238886",
        body: req.body.message,
        to: `whatsapp:+${req.body.number}`,
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
    client.messages
      .create({
        from: "whatsapp:+14155238886",
        body: req.body.message,
        to: `whatsapp:+${req.body.number}`,
      })
      .then(() =>
        res
          .status(201)
          .send(res.status(201).send("Visit https://ml.mvergara.net"))
      );
  } catch (error) {
    console.error("error", error);
    res.status(404).send(error);
  }
});

app.listen(port, () => {
  console.info(`[server]: Server is running at http://localhost:${port}`);
});
