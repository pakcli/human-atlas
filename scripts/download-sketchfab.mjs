#!/usr/bin/env node
/**
 * Download 3D Model from Sketchfab Download API v3
 * Usage:
 *   node scripts/download-sketchfab.mjs [SKETCHFAB_API_TOKEN] [MODEL_UID]
 * Or set environment variable:
 *   $env:SKETCHFAB_API_TOKEN="your_token"
 *   node scripts/download-sketchfab.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'raw');

const DEFAULT_UID = '6c89dc45574c40b3981e8de6310d28d4'; // Female Reproductive Organs-X Section
const token = process.argv[2] || process.env.SKETCHFAB_API_TOKEN;
const modelUid = process.argv[3] || DEFAULT_UID;

if (!token) {
  console.error('\x1b[31mError: Sketchfab API Token is required.\x1b[0m');
  console.error('\nHow to get your API Token:');
  console.error('1. Log in to Sketchfab -> Go to https://sketchfab.com/settings/password');
  console.error('2. Copy your "API Token" at the bottom of the page.');
  console.error('\nUsage:');
  console.error('  node scripts/download-sketchfab.mjs <YOUR_TOKEN>');
  console.error('Or:');
  console.error('  $env:SKETCHFAB_API_TOKEN="<YOUR_TOKEN>"; node scripts/download-sketchfab.mjs');
  process.exit(1);
}

fs.mkdirSync(RAW_DIR, { recursive: true });

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error (${res.statusCode}): ${parsed.detail || data}`));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed with status: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function main() {
  console.log(`\x1b[36mQuerying Sketchfab Download API for model: ${modelUid}...\x1b[0m`);
  
  const downloadUrlEndpoint = `https://api.sketchfab.com/v3/models/${modelUid}/download`;
  const downloadInfo = await fetchJson(downloadUrlEndpoint, {
    Authorization: `Token ${token}`,
  });

  const gltfInfo = downloadInfo.gltf;
  if (!gltfInfo || !gltfInfo.url) {
    throw new Error('No glTF format download URL returned by Sketchfab API.');
  }

  console.log(`✓ Got download link (Expires in ${Math.round(gltfInfo.expires / 60)} minutes, Size: ${(gltfInfo.size / (1024 * 1024)).toFixed(2)} MB)`);

  const zipPath = path.join(RAW_DIR, 'female-reproductive-organs.zip');
  console.log(`Downloading zip to ${zipPath}...`);
  await downloadFile(gltfInfo.url, zipPath);
  console.log(`✓ Download complete!`);

  const extractDir = path.join(RAW_DIR, 'female-reproductive-organs');
  fs.mkdirSync(extractDir, { recursive: true });

  console.log(`Extracting zip to ${extractDir}...`);
  try {
    // Windows PowerShell Expand-Archive or tar
    execSync(`tar -xf "${zipPath}" -C "${extractDir}"`, { stdio: 'inherit' });
  } catch {
    execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`, { stdio: 'inherit' });
  }

  console.log(`\x1b[32m✓ Successfully downloaded and extracted model to raw/female-reproductive-organs/!\x1b[0m`);
}

main().catch((err) => {
  console.error('\x1b[31mError:\x1b[0m', err.message);
  process.exit(1);
});
