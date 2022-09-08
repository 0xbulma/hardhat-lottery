import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { useEffect, useState, useCallback } from 'react';

import WalletConnectProvider from '@walletconnect/web3-provider';
import { providers } from 'ethers';

export function chainIdHelper(chainId) {
  switch (chainId) {
    case '0x5':
      return 'goerli';
    default:
      return 'Wrong Chain please connect to Goerli';
  }
}

export function useCheckConnectionOnLoad(handler) {
  useEffect(() => {
    const asynFn = async () => {
      const isConnected = await ethereum.request({ method: 'eth_accounts' });

      if (isConnected.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        async function fetchInfo() {
          handler(await getWalletInfo(provider));
        }
        fetchInfo();
      }
    };
    asynFn();
  });
}

export function useAccountChangesListener(handler) {
  useEffect(() => {
    window.ethereum.on('accountsChanged', handler);
    return () => {
      window.ethereum.removeListener('accountsChanged', handler);
    };
  }, [handler]);
}

export function useChainChangesListener(handler) {
  useEffect(() => {
    window.ethereum.on('chainChanged', handler);
    return () => {
      window.ethereum.removeListener('chainChanged', handler);
    };
  }, [handler]);
}

export function useDisconnectListener(handler) {
  useEffect(() => {
    window.ethereum.on('disconnect', handler);
    return () => {
      window.ethereum.removeListener('disconnect', handler);
    };
  }, [handler]);
}

export async function getWalletInfo(provider) {
  const { name } = await provider.getNetwork();
  const signer = provider.getSigner();
  let address = await signer.getAddress();
  let balance = await signer.getBalance();

    const res = {
    provider,
    address,
    signer,
    balance : ethers.utils.formatEther(balance),
    chainName:
      name === 'goerli' ? name : 'Wrong Chain please connect to Goerli',
  };

  return res;
}

export async function connect() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // MetaMask requires requesting permission to connect users accounts
  await provider.send('eth_requestAccounts', []);

  return await getWalletInfo(provider);
}
