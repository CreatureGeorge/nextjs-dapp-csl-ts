import CardanoBrowserWasm from '../api/loader';
import { Buffer } from 'buffer';
import {
  stringToBigNum,
  returnProtocols,
  readableTransactionUnspentOutput,
  readableAddress,
  readableValue,
  readableTransactionBody,
  readableTXHash,
  returnAddress,
  returnTransactionUnspentOutput,
  returnValue,
} from './base';
import AssetFingerprint from '@emurgo/cip14-js';

declare let cardano: any;
let wallet = null;
let csl = null;

export async function enableWallet(walletName) {
  if (!window.cardano || !window.cardano[walletName]) {
    alert(`wallet not found!`);
    return;
  }

  await CardanoBrowserWasm.load();
  csl = CardanoBrowserWasm.Cardano;

  wallet = await cardano[walletName].enable();

  const networkID = await wallet.getNetworkId();

  const balance = await wallet.getBalance();

  const changeAddress = await wallet.getChangeAddress();

  const collateral =
    walletName == `nami`
      ? await wallet.experimental.getCollateral()
      : await wallet.getCollateral();
  const collateralJSON = {};
  const collateralUtxos = collateral.map((utxo) =>
    returnTransactionUnspentOutput(utxo, csl),
  );
  if (Object.keys(collateralUtxos).length > 0)
    readableTransactionUnspentOutput(collateralJSON, collateralUtxos[0]);

  const network =
    networkID == 0
      ? `testnet`
      : networkID == 1
      ? `mainnet`
      : `unknown: ${networkID}`;
  const rewardAddresses = await wallet.getRewardAddresses();

  const unusedAddresses = await wallet.getUnusedAddresses();
  const unusedAddressesJSON = [];
  unusedAddresses.forEach((addr) => {
    unusedAddressesJSON.push(readableAddress(addr, csl));
  });

  const usedAddresses = await wallet.getUsedAddresses();
  const usedAddressesJSON = [];
  usedAddresses.forEach((addr) => {
    console.log(addr);
    usedAddressesJSON.push(readableAddress(addr, csl));
  });

  const utxos = await wallet.getUtxos();
  const parsedUtxos = utxos.map((utxo) =>
    returnTransactionUnspentOutput(utxo, csl),
  );
  const utxoJSON = {};
  parsedUtxos.forEach((utxo) => {
    readableTransactionUnspentOutput(utxoJSON, utxo);
  });

  document.getElementById(`walletBalance`).innerHTML = JSON.stringify(
    readableValue(returnValue(balance, csl)),
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
  document.getElementById(`usedAddresses`).innerHTML = JSON.stringify(
    usedAddressesJSON,
    null,
    2,
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
//for now assume nami and ccvault
//just sending 1 ada depending on testnet or mainnet
export async function simpleTX() {
  if (wallet == null) {
    alert(`wallet not found!`);
    return;
  }

  const networkID = await wallet.getNetworkId();

  if (csl == null) {
    await CardanoBrowserWasm.load();
    csl = CardanoBrowserWasm.Cardano;
  }

  const addressHex = Buffer.from((await wallet.getUsedAddresses())[0], `hex`);

  const address = csl.BaseAddress.from_address(
    csl.Address.from_bytes(addressHex),
  )
    .to_address()
    .to_bech32();

  const walletAddr = csl.Address.from_bech32(address);

  const mainnetAddr = csl.Address.from_bech32(
    `addr1q99g97ke5u36lhc6zqcsgl36y28479uf72yzf7h8s4p7a5c38ncl66pmgnw5gmy8dxypulakfzflu6qet2pnxuljvyxsl7nm7z`,
  );
  const testnetAddr = csl.Address.from_bech32(
    `addr_test1qp9g97ke5u36lhc6zqcsgl36y28479uf72yzf7h8s4p7a5c38ncl66pmgnw5gmy8dxypulakfzflu6qet2pnxuljvyxsugwmja`,
  );

  const outputAddr = networkID == 1 ? mainnetAddr : testnetAddr;

  //need to grabe config file function
  const txBuilder = csl.TransactionBuilder.new(returnProtocols(csl));

  const utxos = await wallet.getUtxos();
  const parsedUtxos = utxos.map((utxo) =>
    returnTransactionUnspentOutput(utxo, csl),
  );

  //need to grab what is needed from here
  let utxo = null;
  console.log(Object.keys(parsedUtxos).length);
  for (const utxoEntry of parsedUtxos) {
    const utxoLovelace = readableValue(utxoEntry.output().amount())[`lovelace`];
    if (utxoLovelace >= 2000000) {
      utxo = utxoEntry;
    }
  }

  if (utxo == null) {
    alert(`no available utxo found!`);
    return;
  }

  console.log(readableTXHash(utxo.input()));
  console.log(utxo.input().index());
  console.log(readableValue(utxo.output().amount()));

  txBuilder.add_input(walletAddr, utxo.input(), utxo.output().amount());

  txBuilder.add_output(
    csl.TransactionOutput.new(
      outputAddr,
      csl.Value.new(stringToBigNum(`1000000`, csl)),
    ),
  );

  //need to set ttl 3 hours from current slot
  txBuilder.set_ttl(76904644);

  //always sender in this case...unless multiple wallets are signing...but will only be policy
  txBuilder.add_change_if_needed(walletAddr);

  const txBody = txBuilder.build();
  console.log(txBody);
  const witnesses = csl.TransactionWitnessSet.new();

  let transaction = csl.Transaction.new(txBody, witnesses, undefined);
  let transactionbyte = transaction.to_bytes();
  const witnessesigned = await wallet.signTx(
    readableTransactionBody(transactionbyte),
    false,
  );

  const witnesseset = csl.TransactionWitnessSet.from_bytes(
    Buffer.from(witnessesigned, `hex`),
  );
  console.log(witnesseset);
  transaction = csl.Transaction.new(txBody, witnesseset, undefined);
  transactionbyte = transaction.to_bytes();
  wallet.submitTx(readableTransactionBody(transactionbyte));

  return ``;
}
