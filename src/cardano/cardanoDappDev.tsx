import CardanoWasm from './loader';
import { Buffer } from 'buffer';
import AssetFingerprint from '@emurgo/cip14-js';

declare let cardano: any;

export async function enableWallet(walletName) {
  if (!window.cardano || !window.cardano[walletName]) {
    alert(`wallet not found!`);
    return;
  }

  await CardanoWasm.load();
  const csl = CardanoWasm.Cardano;

  const wallet = await cardano[walletName].enable();

  const networkID = await wallet.getNetworkId();

  const balance = await wallet.getBalance();

  const changeAddress = await wallet.getChangeAddress();
  const collateral =
    walletName == `nami`
      ? await wallet.experimental.getCollateral()
      : await wallet.getCollateral();

  const collateralJSON = {};
  const collateralUtxos = collateral.map((utxo) =>
    csl.TransactionUnspentOutput.from_bytes(Buffer.from(utxo, `hex`)),
  );
  readTransactionUnspentOutput(collateralJSON, collateralUtxos[0]);

  const network =
    networkID == 0
      ? `testnet`
      : networkID == 1
      ? `mainnet`
      : `unknown: ${networkID}`;
  const rewardAddresses = await wallet.getRewardAddresses();
  const unusedAddresses = await wallet.getUnusedAddresses();
  const usedAddresses = await wallet.getUsedAddresses();
  const utxos = await wallet.getUtxos();
  const parsedUtxos = utxos.map((utxo) =>
    csl.TransactionUnspentOutput.from_bytes(Buffer.from(utxo, `hex`)),
  );

  const utxoJSON = {};
  parsedUtxos.forEach((utxo) => {
    readTransactionUnspentOutput(utxoJSON, utxo);
  });

  const unusedAddressesJSON = [];

  unusedAddresses.forEach((addr) => {
    unusedAddressesJSON.push(readableAddress(addr, csl));
  });

  document.getElementById(`walletBalance`).innerHTML = JSON.stringify(
    readValue(csl.Value.from_bytes(Buffer.from(balance, `hex`))),
    null,
    2,
  );
  document.getElementById(`changeAddress`).innerHTML = readableAddress(
    changeAddress,
    csl,
  );
  document.getElementById(`collateral`).innerHTML = JSON.stringify(
    collateralJSON,
    null,
    2,
  );
  document.getElementById(`networkID`).innerHTML = network;

  document.getElementById(`rewardAddresses`).innerHTML = rewardAddresses;
  document.getElementById(`unusedAddresses`).innerHTML = JSON.stringify(
    unusedAddressesJSON,
    null,
    2,
  );
  document.getElementById(`usedAddresses`).innerHTML = readableAddress(
    usedAddresses[0],
    csl,
  );
  document.getElementById(`utxos`).innerHTML = JSON.stringify(
    utxoJSON,
    null,
    2,
  );
}

export async function checkWalletEnable() {
  if (!window.cardano) {
    alert(`wallet not found!`);
  }
}
async function simpleTX() {
  return ``;
}

function readableAddress(addr, csl) {
  return csl.Address.from_bytes(Buffer.from(addr, `hex`)).to_bech32();
}

function readableTXHash(txInput) {
  return Buffer.from(txInput.transaction_id().to_bytes(), `hex`).toString(
    `hex`,
  );
}

function readTransactionUnspentOutput(utxosJSON, utxo) {
  const txOutput = utxo.output();
  const txInput = utxo.input();
  utxosJSON[`${readableTXHash(txInput)}#${txInput.index()}`] = readValue(
    txOutput.amount(),
  );
}

function readValue(value) {
  const balance = {};

  balance[`lovelace`] = value.coin().to_str();

  if (value.multiasset()) readAssets(value.multiasset(), balance);

  return balance;
}

function readAssets(multiAssets, balance) {
  balance[`assets`] = {};
  const assetsBalance = balance[`assets`];
  const multiAssetKeys = multiAssets.keys();
  for (let i = 0; i < multiAssetKeys.len(); i++) {
    const policy = multiAssetKeys.get(i);
    const policyAssets = multiAssets.get(policy);
    const assetNames = policyAssets.keys();
    for (let j = 0; j < assetNames.len(); j++) {
      const policyAsset = assetNames.get(j);
      const quantity = policyAssets.get(policyAsset);
      const asset =
        Buffer.from(policy.to_bytes(), `hex`).toString(`hex`) +
        Buffer.from(policyAsset.name(), `hex`).toString(`hex`);
      const _policy = asset.slice(0, 56);
      const _name = asset.slice(56);
      // const fingerprint = new AssetFingerprint(
      //     Buffer.from(_policy, 'hex'),
      //     Buffer.from(_name, 'hex')
      // ).fingerprint();
      assetsBalance[_policy] = {
        unit: asset,
        quantity: quantity.to_str(),
        name: HexToAscii(_name),
      };
    }
  }

  function AsciiToBuffer(string) {
    return Buffer.from(string, `ascii`);
  }

  function HexToBuffer(string) {
    return Buffer.from(string, `hex`);
  }

  function AsciiToHex(string) {
    return AsciiToBuffer(string).toString(`hex`);
  }

  function HexToAscii(string) {
    return HexToBuffer(string).toString(`ascii`);
  }

  function BufferToAscii(buffer) {
    return buffer.toString(`ascii`);
  }

  function BufferToHex(buffer) {
    return buffer.toString(`hex`);
  }
}
