const { hashMessage } = require("./scripts/generate");
const secp = require("ethereum-cryptography/secp256k1");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
let nonce = 0;

app.use(cors());
app.use(express.json());

const balances = {
  "04c3ade689bc21c2b4aa7626d401be0e90bd6a2e5dc5d75d701235eba14dc01c8ecb1974fe89ab9d54f4a449fc41408e54c9b7d822f71f263a4383327094f4fd2e": 100,
  "042efb74e562c56d1145b8cede28411d830b49a8aca492b225f8b770434fbc7a421e1b060edaad448c787ebcca29d20dc4622c42b6c168bbe109805840bbc2a7ed": 50,
  "04f293b85b47d42944b79c017fd7a8b6afe3fc61525fe77c016d51f23685bf609d9bdb37ad507059126a36c0b2d570249721dbce6f332ae3e9fd8af457d3bdf95f": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //TODO: verify the signature
  //can use recover key or verify function
  const { sender, recipient, amount, signature } = req.body;
  setInitialBalance(sender);
  setInitialBalance(recipient);
  console.log("passedNonce$", nonce); // using nonce to prevent double spending
  let message = JSON.stringify({
    recipient: recipient,
    amount: amount,
    nonce: nonce++,
  });
  let messageHash = hashMessage(message);
  let isVerified = secp.verify(signature, messageHash, sender);
  console.log("$isVerified", isVerified);
  console.log("nextNonce$", nonce);
  if (isVerified) {
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Incorrect message signature" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
