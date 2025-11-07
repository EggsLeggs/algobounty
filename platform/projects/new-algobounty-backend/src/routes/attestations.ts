import { Router } from 'express';
import * as nacl from 'tweetnacl';
import {
  createAttestationPayload,
  signAttestation,
  verifyAttestation,
  isAttestationExpired,
  type Attestation,
  type AttestationPayload,
} from '../lib/attestation.js';

export const attestationRouter = Router();

// Get attestor public key
attestationRouter.get('/public-key', (req, res) => {
  try {
    const privateKeyBase64 = process.env.ATTESTOR_PRIVATE_KEY;
    if (!privateKeyBase64) {
      return res.status(500).json({ error: 'Attestor private key not configured' });
    }

    const privateKey = Buffer.from(privateKeyBase64, 'base64');
    const keypair = nacl.sign.keyPair.fromSecretKey(privateKey);

    res.json({
      publicKey: Buffer.from(keypair.publicKey).toString('base64'),
    });
  } catch (error) {
    console.error('Error getting public key:', error);
    res.status(500).json({ error: 'Failed to get public key' });
  }
});

// Create attestation
attestationRouter.post('/create', (req, res) => {
  try {
    const { githubId, algorandAddress, nonce, expiryHours } = req.body;

    if (!githubId || !algorandAddress || !nonce) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const privateKeyBase64 = process.env.ATTESTOR_PRIVATE_KEY;
    if (!privateKeyBase64) {
      return res.status(500).json({ error: 'Attestor private key not configured' });
    }

    const privateKey = Buffer.from(privateKeyBase64, 'base64');
    const payload = createAttestationPayload(
      githubId,
      algorandAddress,
      nonce,
      expiryHours || 24
    );

    const attestation = signAttestation(payload, privateKey);

    res.json(attestation);
  } catch (error) {
    console.error('Error creating attestation:', error);
    res.status(500).json({ error: 'Failed to create attestation' });
  }
});

// Verify attestation
attestationRouter.post('/verify', (req, res) => {
  try {
    const attestation: Attestation = req.body;

    if (!attestation.payload || !attestation.signature || !attestation.publicKey) {
      return res.status(400).json({ error: 'Invalid attestation format' });
    }

    const isValid = verifyAttestation(attestation);
    const expired = isAttestationExpired(attestation);

    res.json({
      valid: isValid && !expired,
      expired,
      payload: attestation.payload,
    });
  } catch (error) {
    console.error('Error verifying attestation:', error);
    res.status(500).json({ error: 'Failed to verify attestation' });
  }
});

