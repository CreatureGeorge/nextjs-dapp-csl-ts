import CardanoWasm from './loader';
import { Buffer } from 'buffer';

declare var cardano: any;

export async function enableWallet(walletName) {
  if (!window.cardano || !window.cardano[walletName]) {
    alert('wallet not found!');
    return;
  }

  await CardanoWasm.load();
  let S = CardanoWasm.Cardano;

  let wallet = await cardano[walletName].enable();

  let networkID = await wallet.getNetworkId();

  let balance = await wallet.getBalance();
  let changeAddress = await wallet.getChangeAddress();
  let collateral =
    walletName == 'nami'
      ? await wallet.experimental.getCollateral()
      : await wallet.getCollateral();
  let network =
    networkID == 0
      ? 'testnet'
      : networkID == 1
      ? 'mainnet'
      : `unknown: ${networkID}`;
  let rewardAddresses = await wallet.getRewardAddresses();
  let unusedAddresses = await wallet.getUnusedAddresses();
  let usedAddresses = await wallet.getUsedAddresses();

  let unusedAddressesJSON = [];

  unusedAddresses.forEach((addr) => {
    unusedAddressesJSON.push(readableAddress(addr, S));
  });

  document.getElementById('walletBalance').innerHTML = balance;
  document.getElementById('changeAddress').innerHTML = readableAddress(
    changeAddress,
    S,
  );
  document.getElementById('collateral').innerHTML = collateral;
  document.getElementById('networkID').innerHTML = network;

  document.getElementById('rewardAddresses').innerHTML = rewardAddresses;
  document.getElementById('unusedAddresses').innerHTML = JSON.stringify(
    unusedAddressesJSON,
    null,
    2,
  );
  document.getElementById('usedAddresses').innerHTML = readableAddress(
    usedAddresses[0],
    S,
  );
  document.getElementById('utxos').innerHTML = await wallet.getUtxos();
}
export async function checkWalletEnable() {
  if (!window.cardano) {
    alert('wallet not found!');
  }
}
async function simpleTX() {}

function readableAddress(addr, S) {
  return S.Address.from_bytes(Buffer.from(addr, 'hex')).to_bech32();
}
