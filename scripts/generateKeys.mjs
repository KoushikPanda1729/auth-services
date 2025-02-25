import fs from "fs";
import crypto from "crypto";
import path from "path";

// Generate the keys
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
});

if (!fs.existsSync("certs")) {
  fs.mkdirSync("certs");
}

fs.writeFileSync("certs/privateKey.pem", privateKey);
fs.writeFileSync("certs/publicKey.pem", publicKey);
