import { BigNumber, ethers } from "ethers";
import { getRPC, isProduction } from "../utls";
import { Erc20 } from "./interfaces";
import Abi from "./abis/hs_hsdb_staking.json";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { IPackage, IStakedInfo } from "./types";

export const ADDRESS = () =>
  isProduction()
    ? "0xF84f4558a787b7F0ce4c8bD5cD555a511fA2eC77"
    : "0x23E19e331F0FB8e13DDB4DE4D96FaD2a29E31Dd7";

export default class HsUsdbStakingContract extends Erc20 {
  constructor(signer?: ethers.providers.JsonRpcSigner) {
    const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
    super(rpcProvider, ADDRESS(), Abi, signer);
  }

  stakedBalance = async (address: string): Promise<number> => {
    const response = await this._contract.stakedBalance(address);
    return this._toNumberBalance(response);
  };

  stake = async (pack: string, amount: number) => {
    const response: TransactionResponse = await this._contract.stake(
      pack,
      this._toWei(amount),
      this._option
    );
    return this._handleTransactionResponse(response);
  };

  getPoolInfo = async () => {
    const response: BigNumber[] = await this._contract.poolInfor();
    const rpNumber = response.map((p) => this._toNumberBalance(p));
    return {
      locked: rpNumber[0],
      totalStaked: rpNumber.reduce((pre, cur) => pre + cur, 0),
    };
  };

  getStakedInfo = async (address: string): Promise<IStakedInfo[]> => {
    const rp: Array<any> = await this._contract.stakedInfors(address);
    const result = rp.map((obj, index) => ({
      index,
      amount: this._toNumberBalance(obj[0]),
      startTime: this._toNumber(obj[1]),
      releaseDate: this._toNumber(obj[2]),
      rewardDebt: this._toNumberBalance(obj[3]),
      package: this._toNumber(obj[4]),
    }));
    return result;
  };

  unState = async (structIndex: number) => {
    const rp: TransactionResponse = await this._contract.unStake(
      structIndex,
      this._option
    );
    return this._handleTransactionResponse(rp);
  };

  getPackage = async (): Promise<IPackage[]> => {
    const rp: any[] = await this._contract.getPackage();
    const result = rp.map((item, index) => ({
      index,
      value: this._toNumber(item),
      percent: this._toNumber(item) / 100,
    }));
    return result;
  };
}
