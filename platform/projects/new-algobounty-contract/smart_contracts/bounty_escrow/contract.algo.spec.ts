import { Account, Global, Uint64 } from '@algorandfoundation/algorand-typescript'
import { TestExecutionContext } from '@algorandfoundation/algorand-typescript-testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { BountyEscrow } from './contract.algo'

describe.skip('BountyEscrow contract (requires Algorand TS txn harness support)', () => {
  const ctx = new TestExecutionContext()
  const bountyKey = 'repo/issue#1'
  let contract: BountyEscrow

  beforeEach(() => {
    ctx.reset()
    contract = ctx.contract.create(BountyEscrow)
    contract.createApplication()
  })

  const app = () => ctx.ledger.getApplicationForContract(contract)

  const fund = (amount: number) => {
    const contractAny = contract as unknown as {
      resolveFundingPayment: (idx: unknown) => { amount: Uint64; receiver: Account; sender: Account }
    }
    const originalResolver = contractAny.resolveFundingPayment
    contractAny.resolveFundingPayment = () => ({
      amount: Uint64(amount),
      receiver: Global.currentApplicationAddress,
      sender: ctx.defaultSender,
    })
    contract.fundBounty(bountyKey, 0)
    contractAny.resolveFundingPayment = originalResolver
  }

  it('tracks funding totals', () => {
    fund(2_000_000)
    expect(contract.getTotalFunded(bountyKey)).toBe(Uint64(2_000_000))
    expect(contract.isBountyClosed(bountyKey)).toBe(false)
    expect(contract.totalLocked.value).toBe(Uint64(2_000_000))
  })

  it('prevents claims until closed', () => {
    fund(1_000_000)

    expect(() => contract.claimBounty(bountyKey, ctx.any.account())).toThrowError('bounty still open')
  })

  it('allows authorized claimer to withdraw after closure', () => {
    fund(3_000_000)
    const claimer = ctx.any.account()

    contract.markIssueClosed(bountyKey, claimer)
    ctx.defaultSender = claimer

    contract.claimBounty(bountyKey, claimer)
    expect(contract.isBountyClaimed(bountyKey)).toBe(true)
    expect(contract.getTotalClaimed(bountyKey)).toBe(contract.getTotalFunded(bountyKey))
    expect(contract.totalLocked.value).toBe(Uint64(0))
  })

  it('blocks unauthorized recipients when a claimer is set', () => {
    fund(500_000)
    const claimer = ctx.any.account()
    const impostor = ctx.any.account()

    contract.assignClaimer(bountyKey, claimer)
    contract.markIssueClosed(bountyKey, Account())
    ctx.defaultSender = impostor

    expect(() => contract.claimBounty(bountyKey, impostor)).toThrowError('recipient not authorized')
  })
})

