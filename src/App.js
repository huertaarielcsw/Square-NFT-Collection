import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json';
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = 'huertaarielcsw';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  'https://testnets.opensea.io/collection/squarenft-ykq9erwesl';
const TOTAL_MINT_COUNT = 15;
const CONTRACT_ADDRESS = '0x53FfC2FFc01184cBa366E84dE60FF988B2C27526';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [showToast, setShowToast] = useState('');
  const [nftCount, setNftCount] = useState(0);
  const [mintState, setMintState] = useState('');

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('Connected to chain ' + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = '0x4';
      if (chainId !== rinkebyChainId) {
        alert('You are not connected to the Rinkeby Test Network!');
      }

      setupEventListener();
    } else {
      console.log('No authorized account found');
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);

      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        const getTotalNFTsMinted = async () => {
          const nftTxn = await connectedContract.getTotalNFTsMintedSoFar();
          setNftCount(nftTxn.toNumber());

          setShowToast('show');
          setTimeout(() => {
            setShowToast('hide');
          }, 5000);
        };

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          getTotalNFTsMinted();
          console.log(from, tokenId.toNumber());
          /*alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );*/
        });

        console.log('Setup event listener!');
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        try {
          setMintState('mining');
          console.log('Going to pop wallet now to pay gas...');
          let nftTxn = await connectedContract.makeAnEpicNFT();

          console.log('Mining...please wait.');
          await nftTxn.wait();
          setMintState('mining');

          console.log(
            `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
          );

          setMintState('mined');
        } catch (error) {
          setMintState('mined');
          setNftCount(TOTAL_MINT_COUNT);

          setShowToast('show');
          setTimeout(() => {
            setShowToast('hide');
          }, 1000);
          console.log(error);
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      Mint NFT
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div id="toast" className={showToast}>
          <div id="desc">
            {nftCount}/{TOTAL_MINT_COUNT} NFTs minted so far
          </div>
        </div>
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === ''
            ? renderNotConnectedContainer()
            : renderMintUI()}
        </div>
        <div>
          {mintState === 'mining' && (
            <div className="loading-indicator">
              <LoadingIndicator />
            </div>
          )}
        </div>
        <div>
          <a href={OPENSEA_LINK}>
            <button className="cta-button opensea-button">
              🌊 View Collection on OpenSea
            </button>
          </a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
