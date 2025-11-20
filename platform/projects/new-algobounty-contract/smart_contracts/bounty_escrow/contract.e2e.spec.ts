import { Account, Global, Uint64 } from '@algorandfoundation/algorand-typescript'
import { TestExecutionContext } from '@algorandfoundation/algorand-typescript-testing'
import { afterEach, describe, expect, it } from 'vitest'
import { BountyEscrow } from './contract.algo'

describe.skip('BountyEscrow e2e flow (awaiting transaction mocks)', () => {
  const ctx = new TestExecutionContext()
  const bountyKey = 'repo#42'

  afterEach(() => ctx.reset())

  it('aggregates multiple funders and releases funds to claimer', () => {
    const contract = ctx.contract.create(BountyEscrow)
    contract.createApplication()

    const app = ctx.ledger.getApplicationForContract(contract)
    const alice = ctx.any.account()
    const bob = ctx.any.account()
    const claimer = ctx.any.account()

    const deposit = (funder: Account, amount: number) => {
      ctx.defaultSender = funder
      const contractAny = contract as unknown as {
        resolveFundingPayment: (idx: unknown) => { amount: Uint64; receiver: Account; sender: Account }
      }
      const originalResolver = contractAny.resolveFundingPayment
      contractAny.resolveFundingPayment = () => ({
        amount: Uint64(amount),
        receiver: Global.currentApplicationAddress,
        sender: funder,
      })
      contract.fundBounty(bountyKey, 0)
      contractAny.resolveFundingPayment = originalResolver
    }

    deposit(alice, 2_000_000)
    deposit(bob, 4_000_000)

    expect(contract.getTotalFunded(bountyKey)).toBe(Uint64(6_000_000))

    ctx.defaultSender = alice
    contract.markIssueClosed(bountyKey, claimer)

    const claimerAccountBefore = ctx.ledger.getAccount(claimer).balance
    ctx.defaultSender = claimer
    contract.claimBounty(bountyKey, claimer)
    const claimerAccountAfter = ctx.ledger.getAccount(claimer).balance

    expect(claimerAccountAfter - claimerAccountBefore).toBe(6_000_000)
    expect(contract.totalLocked.value).toBe(Uint64(0))
    expect(contract.isBountyClaimed(bountyKey)).toBe(true)
  })
})

