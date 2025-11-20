import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { BountyEscrowFactory } from '../artifacts/bounty_escrow/BountyEscrowClient'

export async function deploy() {
  console.log('=== Deploying BountyEscrow ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  const factory = algorand.client.getTypedAppFactory(BountyEscrowFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient, result } = await factory.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
  })

  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      sender: deployer.addr,
      receiver: appClient.appAddress,
      amount: (2).algo(),
    })
  }

  console.log(`BountyEscrow deployed. App ID: ${appClient.appId}`)
}

