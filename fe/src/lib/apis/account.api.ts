import axiosInstance from ".";

export interface IWalletPoint {
  address: string;
  supplyPoint: number;
  stakingPoint: number;
  stakingLockPoint: number;
  referralPoint: number;
  point: number;
  updatedTime: string;
  latestTx: string;
  referralCode: string;
  joinedCode: null | string;
  members: number;
}

export interface ILeaderboardResponse {
  leaderboard: IWalletPoint[];
  totalUser: number;
}
export const addPointApi = async (
  txHash: string,
  refCode?: string
): Promise<IWalletPoint> => {
  return axiosInstance.post(`wallet/point/`, { txHash, refCode });
};

export const getWalletPointApi = async (
  walletAddress: string
): Promise<IWalletPoint> => {
  return axiosInstance.get(`wallet/point/${walletAddress}`);
};

export const getLeaderboardApi = async (
  top: number = 20
): Promise<ILeaderboardResponse> => {
  return axiosInstance.get(`wallet/leaderBoard/${top}`);
};

export const signMessageWallet = async (
  wallet: string,
  joinCode: string,
  signature: string
) => {
  return axiosInstance.post(`wallet/join`, {
    wallet,
    joinCode,
    signature,
  });
};
