//convert to nodejs import from cardanowasm...not sure why not working for now...import CardanoBrowserWasm from '@/api/loader';
import { Buffer } from 'buffer';

export function stringToBigNum(number, csl) {
  return csl.BigNum.from_str(number);
}

export function returnProtocols(csl) {
  return csl.TransactionBuilderConfigBuilder.new()
    .fee_algo(
      csl.LinearFee.new(
        stringToBigNum(`44`, csl),
        stringToBigNum(`155381`, csl),
      ),
    )
    .coins_per_utxo_word(stringToBigNum(`34482`, csl))
    .pool_deposit(stringToBigNum(`500000000`, csl))
    .key_deposit(stringToBigNum(`2000000`, csl))
    .max_value_size(5000)
    .max_tx_size(16384)
    .build();
}

//#region READABLE objects
export function readableTransactionUnspentOutput(utxosJSON, utxo) {
  const txOutput = utxo.output();
  const txInput = utxo.input();
  utxosJSON[`${readableTXHash(txInput)}#${txInput.index()}`] = readableValue(
    txOutput.amount(),
  );
}

export function readableValue(value) {
  const balance = {};

  balance[`lovelace`] = value.coin().to_str();

  if (value.multiasset()) readableAssets(value.multiasset(), balance);

  return balance;
}

export function readableAssets(multiAssets, balance) {
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

      if (!(_policy in assetsBalance)) assetsBalance[_policy] = {};

      assetsBalance[_policy][_name] = {
        unit: asset,
        quantity: quantity.to_str(),
      };
    }
  }
}

export function readableAddress(addr, csl) {
  return returnAddress(addr, csl).to_bech32();
}

export function readableTransactionBody(txBody) {
  return Buffer.from(txBody, `hex`).toString(`hex`);
}

export function readableTXHash(txInput) {
  return Buffer.from(txInput.transaction_id().to_bytes(), `hex`).toString(
    `hex`,
  );
}
//#endregion

//#region BASE conversions
export function returnAddress(addr, csl) {
  return csl.Address.from_bytes(HexToBuffer(addr));
}

export function returnValue(value, csl) {
  return csl.Value.from_bytes(HexToBuffer(value));
}

export function returnTransactionUnspentOutput(utxo, csl) {
  return csl.TransactionUnspentOutput.from_bytes(HexToBuffer(utxo));
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

//#endregion
