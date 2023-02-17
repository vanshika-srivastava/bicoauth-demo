import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import SocialLogin from '@biconomy/web3-auth';
import { ChainId } from '@biconomy/core-types';
import { ethers } from 'ethers';
import SmartAccount from '@biconomy/smart-account';
import { css } from '@emotion/css';


export default function Auth() {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  useEffect(() => {
    let configureLogin;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }

    return () => {
      clearInterval(configureLogin);
    };
  }, [interval]);

  async function login() {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      const signature1 = await socialLoginSDK.whitelistUrl(
        'https://biconomy-social-auth.vercel.app'
      );
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI),
        whitelistUrls: {
          'https://biconomy-social-auth.vercel.app': signature1,
        },
      });
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current.provider) {
      // sdkRef.current.showConnectModal()
      sdkRef.current.showWallet();
      enableInterval(true);
    } else {
      setupSmartAccount();
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) return;
    sdkRef.current.hideWallet();
    setLoading(true);
    const web3Provider = new ethers.providers.Web3Provider(sdkRef.current.provider);
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
      });

      await smartAccount.init();
      setSmartAccount(smartAccount);
      setLoading(false);
    } catch (err) {
      console.log('error setting up smart account... ', err);
    }
  }

  const logout = async () => {
    if (!sdkRef.current) {
      console.error('Web3Modal not initialized.');
      return;
    }
    await sdkRef.current.logout();
    sdkRef.current.hideWallet();
    setSmartAccount(null);
    enableInterval(false);
  };


  
  return (
<div className={containerStyle}>

      <div className={imagestyle}>
        <img src={'https://raw.githubusercontent.com/bcnmy/sdk-demo/c33591f04e9304a339d64af4cea6b17a6b861091/public/img/logo.svg'} alt="Biconomy Logo"/>
        <h1 className={headerStyle}>Get your SCW using Biconomy</h1>
      </div>
     
  
  <div className={buttonWrapperStyle}>

  {
    !smartAccount && !loading && <button className={buttonStyle} onClick={login}>Login</button>
}

    {
      loading && <p>Loading account details...</p>
    }
 
</div>
  

  {
    !!smartAccount && (
      <div className={containerStyle}>
        <div className={accountStyle}>
        <h3>Smart account address: {smartAccount.address}</h3>
        </div>

        <div className={buttonWrapperStyle}>
        <button className={buttonStyle} onClick={() => window.open(`https://polygonscan.com/address/${smartAccount.address}`, '_blank')}>View Contract on PolygonScan</button>
        </div>
        <div className={buttonWrapperStyle}>
        <button className={buttonStyle} onClick={logout}>Logout</button>
        </div>
      </div>
    )
  }
</div>
)
}



const buttonStyle = css`
padding: 20px;
width: 300px;
border: 100px;
cursor: pointer;
border-radius: 999px;
outline: none;
margin-top: 10px;
background-color:#CC5500;
transition: all .25s;
&:hover {
background-color: purple ; 
}
font-size: 20px;
font-family:'Helvetica';
`

const buttonWrapperStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top:50px;
  color: black;
  font-size:20px;
`;

const headerStyle = css`
font-size: 40px;
padding-left: 550px;
color: black;
font-family: 'Helvetica';
`

const containerStyle = css`
width: 100%;
margin: 0 auto;
align-items: center;
padding-top: 40px;
background-color: #fffef6;
height: 100vh;

`

    
const imagestyle = css `
height: 80px;
background: inherit;
box-shadow: none;
border-bottom: 3px solid black;
margin-bottom: 10px;
display: flex;
padding-left : 30px;
padding-bottom:20px;

`

const accountStyle = css `
display: flex;
font-family :'helvetica';
color : black ;
font-size : 25px;
justify-content: center;
border : 4px solid orange;
padding-top:25px;
padding-bottom:25px;
padding-left:10px;
padding-right:10px;
`
