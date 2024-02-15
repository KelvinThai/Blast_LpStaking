import { createAsyncThunk } from "@reduxjs/toolkit";
import { IWalletBalance } from "./wallet.type";
import { getEthersSigner } from "@/lib/hooks/useEtherSigner";
import HsEthContract from "@/lib/contracts/HsEthContract";
import { toNumberBalance } from "@/lib/contracts/utils/common";
import { IWalletPoint, getWalletPointApi } from "@/lib/apis/account.api";


const default_point: IWalletPoint = {
  address: "",
  supplyPoint: 0,
  stakingPoint: 0,
  point: 0,
  updatedTime: "",
  latestTx: ""
}

export const default_balance: IWalletBalance = {
  eth: 0,
  hsEth: 0,
  point: default_point
}

export const fetchWalletBalanceAction = createAsyncThunk<IWalletBalance, void>("wallet/fetchWalletBalanceAction",async () => {
 try {
  const signer = await getEthersSigner();
  if (!signer) return default_balance;
  const walletAddress = await signer.getAddress();
  const ethBalance = await signer.getBalance();
  const hsEthContract = new HsEthContract();
  const hsBalance = await hsEthContract.balanceOf(walletAddress);
  let yourPoint = default_point;
  try {
     yourPoint = await getWalletPointApi(walletAddress);
  } catch {
  }
  return {
    eth: toNumberBalance(ethBalance),
    hsEth: hsBalance,
    point: yourPoint
  };
 } catch(ex) {
    return default_balance;
 }
})