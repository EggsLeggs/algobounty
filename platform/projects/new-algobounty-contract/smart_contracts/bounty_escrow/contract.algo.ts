import {
  Account,
  BoxMap,
  Bytes,
  Contract,
  Global,
  GlobalState,
  Txn,
  Uint64,
  abimethod,
  assert,
  baremethod,
  bytes,
  gtxn,
  itxn,
  log,
  uint64,
} from '@algorandfoundation/algorand-typescript'

type BountyRecord = {
  totalFunded: uint64
  totalClaimed: uint64
  isClosed: boolean
  isClaimed: boolean
  authorizedClaimer: Account
}

export class BountyEscrow extends Contract {
  private readonly bountyPots = BoxMap<string, BountyRecord>({ keyPrefix: 'b:' })

  public admin = GlobalState<Account>({ key: 'admin' })
  public totalLocked = GlobalState<uint64>({ key: 'total_locked', initialValue: Uint64(0) })

  @baremethod({ onCreate: 'require' })
  createApplication() {
    this.admin.value = Txn.sender
  }

  @abimethod()
  updateAdmin(newAdmin: Account) {
    this.assertAdmin()
    this.admin.value = newAdmin
  }

  @abimethod()
  fundBounty(bountyKey: string, paymentTxnIndex: uint64) {
    const payment = this.resolveFundingPayment(paymentTxnIndex)
    const record = this.readRecord(bountyKey)
    const updatedRecord: BountyRecord = {
      ...record,
      totalFunded: Uint64(record.totalFunded + payment.amount),
    }

    this.totalLocked.value = Uint64(this.totalLocked.value + payment.amount)
    this.bountyPots(bountyKey).value = updatedRecord
    log('bounty_funded', Bytes(bountyKey), payment.amount)
  }

  @abimethod()
  markIssueClosed(bountyKey: string, claimer: Account) {
    this.assertAdmin()
    const record = this.readExistingRecord(bountyKey)
    const updatedRecord: BountyRecord = {
      ...record,
      isClosed: true,
      authorizedClaimer: this.isZeroAccount(claimer) ? record.authorizedClaimer : claimer,
    }

    this.bountyPots(bountyKey).value = updatedRecord
    log('bounty_closed', Bytes(bountyKey))
  }

  @abimethod()
  assignClaimer(bountyKey: string, claimer: Account) {
    this.assertAdmin()
    const record = this.readExistingRecord(bountyKey)
    const updatedRecord: BountyRecord = {
      ...record,
      authorizedClaimer: claimer,
    }

    this.bountyPots(bountyKey).value = updatedRecord
    log('claimer_assigned', Bytes(bountyKey))
  }

  @abimethod()
  claimBounty(bountyKey: string, recipient: Account) {
    const record = this.readExistingRecord(bountyKey)

    assert(record.isClosed, 'bounty still open')
    assert(!record.isClaimed, 'bounty already claimed')
    this.ensureClaimAuthorization(record, recipient)

    const remaining = Uint64(record.totalFunded - record.totalClaimed)
    assert(remaining > Uint64(0), 'nothing to claim')

    itxn.payment({
      sender: Global.currentApplicationAddress,
      receiver: recipient,
      amount: remaining,
    }).submit()

    const updatedRecord: BountyRecord = {
      ...record,
      totalClaimed: Uint64(record.totalClaimed + remaining),
      isClaimed: true,
    }

    this.totalLocked.value = Uint64(this.totalLocked.value - remaining)
    this.bountyPots(bountyKey).value = updatedRecord
    log('bounty_claimed', Bytes(bountyKey), remaining)
  }

  @abimethod({ readonly: true })
  getTotalFunded(bountyKey: string): uint64 {
    return this.readRecord(bountyKey).totalFunded
  }

  @abimethod({ readonly: true })
  getTotalClaimed(bountyKey: string): uint64 {
    return this.readRecord(bountyKey).totalClaimed
  }

  @abimethod({ readonly: true })
  isBountyClosed(bountyKey: string): boolean {
    return this.readRecord(bountyKey).isClosed
  }

  @abimethod({ readonly: true })
  isBountyClaimed(bountyKey: string): boolean {
    return this.readRecord(bountyKey).isClaimed
  }

  @abimethod({ readonly: true })
  getAuthorizedClaimer(bountyKey: string): bytes {
    return this.readRecord(bountyKey).authorizedClaimer.bytes
  }

  private resolveFundingPayment(paymentTxnIndex: uint64) {
    assert(paymentTxnIndex < Txn.groupIndex, 'funding index invalid')
    const paymentTxn = gtxn.PaymentTxn(paymentTxnIndex)
    assert(paymentTxn.amount > Uint64(0), 'amount must be > 0')
    assert(
      paymentTxn.receiver.bytes.equals(Global.currentApplicationAddress.bytes),
      'payment must target contract',
    )
    assert(paymentTxn.sender.bytes.equals(Txn.sender.bytes), 'sender mismatch between txns')

    return paymentTxn
  }

  private readRecord(bountyKey: string): BountyRecord {
    const box = this.bountyPots(bountyKey)
    return box.exists ? box.value : this.emptyRecord()
  }

  private readExistingRecord(bountyKey: string): BountyRecord {
    const record = this.readRecord(bountyKey)
    assert(record.totalFunded > Uint64(0), 'bounty not funded')
    return record
  }

  private ensureClaimAuthorization(record: BountyRecord, recipient: Account) {
    const hasAssignedClaimer = !this.isZeroAccount(record.authorizedClaimer)
    if (hasAssignedClaimer) {
      assert(
        record.authorizedClaimer.bytes.equals(recipient.bytes),
        'recipient not authorized',
      )
      return
    }

    // TODO: Plug attestation / completion verification when ready.
  }

  private emptyRecord(): BountyRecord {
    return {
      totalFunded: Uint64(0),
      totalClaimed: Uint64(0),
      isClosed: false,
      isClaimed: false,
      authorizedClaimer: this.zeroAccount(),
    }
  }

  private assertAdmin() {
    assert(Txn.sender.bytes.equals(this.admin.value.bytes), 'admin required')
  }

  private isZeroAccount(account: Account): boolean {
    return account.bytes.equals(this.zeroAccount().bytes)
  }

  private zeroAccount(): Account {
    return Account()
  }
}

