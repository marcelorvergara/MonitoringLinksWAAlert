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
    }
  )
  .then((client) => start(client))
  .catch((error) => console.error(error));

function start(client) {
  app.route("/messages").post(async (req, res) => {
    try {
      const exist = await client.checkNumberStatus(req.body.number + "@c.us");
      if (exist.numberExists) {
        const result = await client.sendText(
          req.body.number + "@c.us",
          req.body.message
        );
        res.status(201).send(result);
      }
    } catch (error) {
      console.error(error);
      res.status(404).send(error);
    }
  });
}

app.listen(port, () => {
  console.info(`[server]: Server is running at http://localhost:${port}`);
});
