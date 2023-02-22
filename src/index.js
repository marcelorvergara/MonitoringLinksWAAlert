import express from "express";
import venom from "venom-bot";
import * as fs from "fs";
import * as path from "path";

const port = process.env.PORT || 3002;

const app = express();
app.use(express.json());

const __dirname = path.resolve();
app.use("/tmp", express.static(path.join(__dirname, "tmp")));

venom
  .create(
    "alarm",
    (base64Qr, asciiQR, attempts, urlCode) => {
      var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error("Invalid input string");
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], "base64");

      var imageBuffer = response;
      fs.writeFile(
        "tmp/out-qr.png",
        imageBuffer["data"],
        "binary",
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    // statusFind
    undefined,
    {
      multidevice: true,
      folderNameToken: path.join(__dirname, "tmp", "tokens"),
      logQR: false,
      disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
      disableWelcome: true, // Will disable the welcoming message which appears in the beginning
      headless: true,
      puppeteerOptions: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    }
  )
  .then((client) => start(client))
  .catch((error) => console.error(error));

function start(client) {
  client.onStateChange((state) => {
    console.log("State changed: ", state);
    // force whatsapp take over
    if ("CONFLICT".includes(state)) client.useHere();
    // detect disconnect on whatsapp
    if ("UNPAIRED".includes(state)) console.log("logout");
  });

  let time = 0;
  client.onStreamChange((state) => {
    console.log("State Connection Stream: " + state);
    clearTimeout(time);
    if (state === "DISCONNECTED" || state === "SYNCING") {
      time = setTimeout(() => {
        client.close();
      }, 80000);
    }
  });

  client.onIncomingCall(async (call) => {
    console.log(call);
    client.sendText(
      call.peerJid,
      `Mensagem automática. Desculpe não posso atender.\n Automatic message. Sorry, I can't answer calls`
    );
  });

  app.route("/messages").post(async (req, res) => {
    try {
      // not working in 4.3.7
      // const exist = await client.checkNumberStatus(req.body.number + "@c.us");
      const result = await client.sendText(
        req.body.number + "@c.us",
        req.body.message
      );
      res.status(201).send(result);
    } catch (error) {
      console.error("error", error);
      res.status(404).send(error);
    }
  });
}

app.listen(port, () => {
  console.info(`[server]: Server is running at http://localhost:${port}`);
});
