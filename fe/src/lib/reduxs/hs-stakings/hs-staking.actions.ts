import { createAsyncThunk } from "@reduxjs/toolkit";
import { getEthersSigner } from "@/lib/hooks/useEtherSigner";
import { getEthBalance } from "@/lib/utls";
import HsEthStakingContract from "@/lib/contracts/HsEthStakingContract";

const default_response = {
  locked: 0,
  totalStaked: 0,
  stakedAmount: 0,
}

export const getHsEthStakingInfoAction = createAsyncThunk<{
  locked: number;
  totalStaked: number;
  stakedAmount: number;
}, void>(
  "hs-staking/getHsEthStakingInfoAction",
  async () => {
    try {
      const signer = await getEthersSigner();
      if (!signer) return default_response;
      const address = await signer.getAddress();
      const hsEthStakingContact = new HsEthStakingContract();
      const stakedAmount = await hsEthStakingContact.stakedBalance(address);

      const poolInfor = await hsEthStakingContact.getPoolInfo();
      return {...poolInfor, stakedAmount}
      
    } catch (ex) {
      return default_response
    }
  }
);