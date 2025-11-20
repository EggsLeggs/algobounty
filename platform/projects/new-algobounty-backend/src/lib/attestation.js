"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttestationPayload = createAttestationPayload;
exports.signAttestation = signAttestation;
exports.verifyAttestation = verifyAttestation;
exports.isAttestationExpired = isAttestationExpired;
var nacl = require("tweetnacl");
var MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
var PAYLOAD_PREFIX = "ALGOBOUNTY_ATTESTATION";
/**
 * Create an attestation payload with a future expiry timestamp.
 */
function createAttestationPayload(githubId, algorandAddress, nonce, expiryHours) {
    if (expiryHours === void 0) { expiryHours = 24; }
    if (!githubId || !algorandAddress || !nonce) {
        throw new Error("githubId, algorandAddress and nonce are required");
    }
    if (expiryHours <= 0) {
        throw new Error("expiryHours must be greater than 0");
    }
    var expiry = Date.now() + expiryHours * MILLISECONDS_PER_HOUR;
    return {
        githubId: githubId.toString(),
        algorandAddress: algorandAddress,
        nonce: nonce,
        expiry: expiry,
    };
}
/**
 * Sign the attestation payload using the attestor's Ed25519 private key.
 */
function signAttestation(payload, privateKey) {
    if (!privateKey || privateKey.length !== 64) {
        throw new Error("Invalid private key provided. Expected 64-byte Ed25519 secret key");
    }
    var keyPair = nacl.sign.keyPair.fromSecretKey(new Uint8Array(privateKey));
    var payloadBytes = serializePayload(payload);
    var signature = nacl.sign.detached(payloadBytes, keyPair.secretKey);
    return {
        payload: payload,
        signature: Buffer.from(signature).toString("base64"),
        publicKey: Buffer.from(keyPair.publicKey).toString("base64"),
    };
}
/**
 * Verify an attestation signature.
 */
function verifyAttestation(attestation) {
    var payload = attestation.payload, signature = attestation.signature, publicKey = attestation.publicKey;
    try {
        var payloadBytes = serializePayload(payload);
        var signatureBytes = Buffer.from(signature, "base64");
        var publicKeyBytes = Buffer.from(publicKey, "base64");
        return nacl.sign.detached.verify(payloadBytes, signatureBytes, publicKeyBytes);
    }
    catch (error) {
        console.error("Failed to verify attestation:", error);
        return false;
    }
}
/**
 * Returns true if the attestation payload is expired.
 */
function isAttestationExpired(attestation) {
    return attestation.payload.expiry <= Date.now();
}
/**
 * Serialize the payload into a canonical UTF-8 byte array for signing.
 */
function serializePayload(payload) {
    var canonicalString = [
        PAYLOAD_PREFIX,
        payload.githubId,
        payload.algorandAddress,
        payload.nonce,
        payload.expiry.toString(),
    ].join("|");
    return Buffer.from(canonicalString, "utf8");
}
