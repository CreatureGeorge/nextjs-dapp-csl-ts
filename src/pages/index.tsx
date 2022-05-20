import Head from 'next/head';
import Image from 'next/image';

import styles from '@/styles/Home.module.css';

import { enableWallet } from '../cardano/cardanoDappDev';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Dapper Boi</title>
        <meta
          name="description"
          content="Dapper Boi: Give me all yo ADAs [next.js typescript to mess around with csl]"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <main className={styles.main}>
          <p className={styles.description}>
            Get started by connecting your wallet : {` `}
            <code className={styles.code}>Nami, Flint, Eternl [CCVault]</code>
          </p>

          <div className={styles.grid}>
            <button
              className={styles.card}
              onClick={() => enableWallet(`nami`)}
            >
              <h2>NAMI </h2>
            </button>
            <button
              className={styles.card}
              onClick={() => enableWallet(`flint`)}
            >
              <h2>FLINT </h2>
            </button>
            <button
              className={styles.card}
              onClick={() => enableWallet(`eternl`)}
            >
              <h2>ETERNL </h2>
            </button>
            <button className={styles.card}>
              <h2>Simple TX</h2>
            </button>
          </div>

          <div>
            <p className={styles.code}>getBalance()</p>
            <pre className={styles.code} id="walletBalance"></pre>
            <p></p>

            <p className={styles.code}>getChangeAddress()</p>
            <pre className={styles.code} id="changeAddress"></pre>
            <p></p>

            <p className={styles.code}>getCollateral()</p>
            <pre className={styles.code} id="collateral"></pre>
            <p></p>

            <p className={styles.code}>getNetworkId()</p>
            <pre className={styles.code} id="networkID"></pre>
            <p></p>

            <p className={styles.code}>getRewardAddresses()</p>
            <pre className={styles.code} id="rewardAddresses"></pre>
            <p></p>

            <p className={styles.code}>getUnusedAddresses()</p>
            <pre className={styles.code} id="unusedAddresses"></pre>
            <p></p>

            <p className={styles.code}>getUsedAddresses()</p>
            <pre className={styles.code} id="usedAddresses"></pre>
            <p></p>

            <a className={styles.code}>getUtxos()</a>
            <pre className={styles.code} id="utxos"></pre>
            <p></p>
          </div>
        </main>
      </body>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=typescript-nextjs-starter"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{` `}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
