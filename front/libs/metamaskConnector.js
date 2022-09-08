import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { useEffect, useState, useCallback } from 'react';

export function useAccountChanges(handler) {
  useEffect(() => {
    window.ethereum.on('accountsChanged', handler);
    return () => {
      window.ethereum.removeListener('accountsChanged', handler);
    };
  }, [handler]);
}

export function useChainChanges(handler) {
  useEffect(() => {
    window.ethereum.on('chainChanged', handler);
    return () => {
      window.ethereum.removeListener('chainChanged', handler);
    };
  }, [handler]);
}

export async function connect() {
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });


  return ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(res => {
      console.log(res);
      return res[0];
    })
    .catch(err => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
      } else {
        console.error(err);
      }
    });
}
