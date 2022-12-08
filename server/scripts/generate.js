const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const secp = require("ethereum-cryptography/secp256k1");

//privateKey public key pairs
// privateKey 8729e34be90deac99970ffd6979592c2bb655cbd4d71e3398ee036ea59d0ef83
// publicKey 04c3ade689bc21c2b4aa7626d401be0e90bd6a2e5dc5d75d701235eba14dc01c8ecb1974fe89ab9d54f4a449fc41408e54c9b7d822f71f263a4383327094f4fd2e

// privateKey ada4897aff7ac9bb35ae921062c2aefc1449f96dadf8496b7107277b4eaece48
// publicKey 042efb74e562c56d1145b8cede28411d830b49a8aca492b225f8b770434fbc7a421e1b060edaad448c787ebcca29d20dc4622c42b6c168bbe109805840bbc2a7ed

// privateKey 275543b2d12acb41f3b70244605e3ec2eae9762ceff39dbc07628b08dff6489b
// publicKey 04f293b85b47d42944b79c017fd7a8b6afe3fc61525fe77c016d51f23685bf609d9bdb37ad507059126a36c0b2d570249721dbce6f332ae3e9fd8af457d3bdf95f

// privateKey d27f31dc95b47705c7689ad0f0e687c31773f1648bc306bbff5a44ef313d5d3b
// publicKey 049ad7c12088a52cadecfce696dc77a8cfad8f80049e88104944a989e09a7d1e6535f6b1a41fb0e8a7f2f261da3b45c9ad6eb78215e20d2962c1950be0226f4c8a

// const privateKey = secp.utils.randomPrivateKey();
// console.log("privateKey", toHex(privateKey));

// const publicKey = secp.getPublicKey(privateKey);
// console.log("publicKey", toHex(publicKey));

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  const hash = keccak256(bytes);
  return hash;
}

async function signMessageR(msg, privateKey) {
  const hashed = hashMessage(msg);
  const signed = await secp.sign(toHex(hashed), privateKey, {
    recovered: true,
  });

  console.log(
    "0: recovery & 1: signed message ==>",
    signed[1] + toHex(signed[0])
  );
  //the first letter of the string is recoveryBit and onwards is signature
  return signed[1] + toHex(signed[0]);
}

async function signMessage(privateKey, recipient, amount, nonce) {
  let message = JSON.stringify({
    recipient: recipient,
    amount: parseInt(amount),
    nonce: parseInt(nonce),
  });
  const hashed = hashMessage(message);
  const signed = await secp.sign(toHex(hashed), privateKey);
  console.log("signature$", toHex(signed));
  return toHex(signed);
}

async function recoverKey(message, signature, recoveryBit) {
  console.log(
    "public key",
    toHex(secp.recoverPublicKey(hashMessage(message), signature, recoveryBit))
  );
  return secp.recoverPublicKey(hashMessage(message), signature, recoveryBit);
}

// use this method to generate message signatures with custom nonce
signMessage(
  "8729e34be90deac99970ffd6979592c2bb655cbd4d71e3398ee036ea59d0ef83",
  "042efb74e562c56d1145b8cede28411d830b49a8aca492b225f8b770434fbc7a421e1b060edaad448c787ebcca29d20dc4622c42b6c168bbe109805840bbc2a7ed",
  "27",
  process.argv[2] // aguments start with index 2
);

// signMessage(
//   process.argv[2], // private Key
//   process.argv[3],  // recipient's public key
//   process.argv[4], // amount
//   process.argv[5], // nonce
// );

module.exports = { hashMessage, signMessage, recoverKey };
