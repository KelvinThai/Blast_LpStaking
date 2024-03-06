import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { balance, transactionReceipt } from '../app.utils'
import { Interface } from 'ethers'
import { abis as vaultAbis } from '../abis/vault'
import { IStakingStaked, IVaultStaked } from '../app.types'
import {
  STAKING_ADDRESS,
  USDB_STAKING_ADDRESS,
  USDB_VAULT_ADDRESS,
  VAULT_ADDRESS
} from '../app.settings'
import { abis as stakingAbis } from '../abis/staking'
import { randomUUID } from 'crypto'

@Injectable()
export class WalletService {
  constructor(private readonly prismaService: PrismaService) {}

  async point(address: string) {
    return await this.prismaService.wallet.findUnique({ where: { address } })
  }

  async leaderBoard(take: number) {
    return await this.prismaService.wallet.findMany({ orderBy: { point: 'desc' }, take })
  }

  async createOrUpdate(tx: string, joinedCode: string) {
    const txReceipt = await transactionReceipt(tx)
    const contract = txReceipt.to
    console.log('tx', txReceipt.logs)
    if (
      contract != VAULT_ADDRESS &&
      contract != STAKING_ADDRESS &&
      contract != USDB_VAULT_ADDRESS &&
      contract != USDB_STAKING_ADDRESS
    )
      throw new HttpException('invalid tx', HttpStatus.BAD_REQUEST)

    await this.prismaService.transaction.create({
      data: { txHash: txReceipt.hash, sender: txReceipt.from, contract }
    })

    let staker: string
    if (contract == VAULT_ADDRESS || contract == USDB_VAULT_ADDRESS) {
      const iface = new Interface(vaultAbis)
      let logIndex = 0
      if (contract == USDB_VAULT_ADDRESS) logIndex = 2
      const eventData = iface.parseLog(txReceipt.logs[logIndex])?.args as unknown as IVaultStaked
      staker = eventData.staker
    } else if (contract == STAKING_ADDRESS || contract == USDB_STAKING_ADDRESS) {
      const iface = new Interface(stakingAbis)
      const eventData = iface.parseLog(txReceipt.logs[2])?.args as unknown as IStakingStaked
      staker = eventData.staker
    }

    const onChainBalance = await balance(staker)
    const hasBalance = Object.keys(onChainBalance).find((f) => onChainBalance[f] > 0)

    let wallet = await this.prismaService.wallet.findUnique({ where: { address: staker } })
    if (!wallet && !hasBalance) {
      let refCode = randomUUID()
      while (await this.prismaService.wallet.findUnique({ where: { referralCode: refCode } }))
        refCode = randomUUID()

      const referrer = await this.prismaService.wallet.findUnique({
        where: { referralCode: joinedCode }
      })

      wallet = await this.prismaService.wallet.create({
        data: {
          address: staker,
          latestTx: txReceipt.hash,
          referralCode: refCode,
          joinedCode: referrer ? joinedCode : ''
        }
      })
    }

    return wallet
  }

  async player(wallet: string) {
    for (let i = 0; i < 7; i++) {
      console.log(i, randomUUID())
    }
    return await this.prismaService.wallet.findUnique({ where: { address: wallet } })
  }
}
