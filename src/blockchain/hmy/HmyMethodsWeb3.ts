import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { withDecimals } from '../utils';
import { getAddress } from '@harmony-js/crypto';
const BN = require('bn.js');

interface IHmyMethodsInitParams {
  hmy: Web3;
  hmyTokenContract: Contract;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsWeb3 {
  private hmy: Web3;
  private hmyTokenContract: Contract;
  private hmyManagerContract: Contract;
  private hmyManagerContractAddress: string;
  // private options = { gasPrice: 1000000000, gasLimit: 6721900 };
  private useMetamask = false;

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyTokenContract = params.hmyTokenContract;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyManagerContractAddress = params.hmyManagerContractAddress;

    // if (params.options) {
    //   this.options = params.options;
    // }
  }

  setUseOneWallet = (value: boolean) => value;
  setUseMathWallet = (value: boolean) => value;

  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  approveHmyManger = async (amount: number, sendTxCallback?: (hash: string) => void) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await ethereum.enable();
    }

    const transaction = await this.hmyTokenContract.methods
      .approve(this.hmyManagerContractAddress, withDecimals(amount, 18))
      .send({
        from: this.useMetamask ? accounts[0] : this.hmy.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.hmy.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return transaction;
  };

  burnToken = async (userAddr: string, amount: number, sendTxCallback?: (hash: string) => void) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await ethereum.enable();
    }

    const userAddrHex = getAddress(userAddr).checksum;

    const transaction = await this.hmyManagerContract.methods
      .burnToken(withDecimals(amount, 18), userAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.hmy.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.hmy.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return transaction;
  };

  checkHmyBalance = async (addr: string) => {
    return await this.hmyTokenContract.methods.balanceOf(getAddress(addr).checksum).call();
  };

  totalSupply = async () => {
    return await this.hmyTokenContract.methods.totalSupply().call();
  };
}
