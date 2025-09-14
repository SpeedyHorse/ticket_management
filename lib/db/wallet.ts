import prisma from "../prisma";
import { gcm } from "@noble/ciphers/aes";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { scrypt } from "@noble/hashes/scrypt";
import { randomBytes } from "@noble/ciphers/utils";

function bytesToPreserve(uint8Array: Uint8Array) {
    // convert uint8Array to Base64
    const base64 = btoa(String.fromCharCode(...uint8Array))

    // replace + with -
    // replace / with _
    // replace = with .
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, ".")
}

function preserveToBytes(preserve: string) {
    // replace - with +
    // replace _ with /
    // replace . with =
    const base64 = preserve.replace(/-/g, "+").replace(/_/g, "/").replace(/\./g, "=")
    // convert base64 to Uint8Array
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}

function bytesToHex(uint8Array: Uint8Array) {
    return Array.from(uint8Array).map(v => v.toString(16).padStart(2, "0")).join("")
}

function convertUint8ArrayToString(uint8Array: Uint8Array) {
    return Array.from(uint8Array).map(v => v.toString(16)).join("")
}

async function encryptPrivateKey(privateKey: Uint8Array, password: string) {
    const salt = randomBytes(16)
    const key = await scrypt(
        password,
        salt,
        { N: 2**14, r: 8, p: 1, dkLen: 32 }
    )
    const iv = randomBytes(12)
    const cipher = gcm(key, iv)

    // convert string to Uint8Array
    const encryptedCipher = cipher.encrypt(privateKey)

    return {
        encryptedCipher,
        salt,
        iv
    }
}

export async function createWallet(id: string, password: string) {
    const privateKey = secp256k1.utils.randomSecretKey()
    const publicKey = secp256k1.getPublicKey(privateKey)

    console.log("privateKey", bytesToPreserve(privateKey))

    // console.log("publicKey", publicKey)

    const { encryptedCipher, salt, iv } = await encryptPrivateKey(privateKey, password)

    // console.log("encryptedCipher", encryptedCipher)
    // console.log("salt", salt)
    // console.log("iv", iv)

    const address = '0x' + bytesToHex(keccak_256(publicKey.slice(1)).slice(-20))

    const data = {
        walletAddress: address,
        encryptedPrivateKey: bytesToPreserve(encryptedCipher),
        encryptionSalt: bytesToPreserve(salt),
        encryptionIv: bytesToPreserve(iv),
        walletCreated: true
    }
    console.log("data", data)

    const user = await prisma.user.update({
        where: { id },
        data: data
    })

    return user
}