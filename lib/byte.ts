export function bytesToPreserve(uint8Array: Uint8Array) {
    // convert uint8Array to Base64
    const base64 = btoa(String.fromCharCode(...uint8Array))

    // replace + with -
    // replace / with _
    // replace = with .
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, ".")
}

export function preserveToBytes(preserve: string) {
    // replace - with +
    // replace _ with /
    // replace . with =
    const base64 = preserve.replace(/-/g, "+").replace(/_/g, "/").replace(/\./g, "=")
    // convert base64 to Uint8Array
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}

export function bytesToHex(uint8Array: Uint8Array) {
    return Array.from(uint8Array).map(v => v.toString(16).padStart(2, "0")).join("")
}

export function convertUint8ArrayToString(uint8Array: Uint8Array) {
    return Array.from(uint8Array).map(v => v.toString(16)).join("")
}