from algokit_utils import (
    ApplicationSpecification,
    get_account,
    get_algod_client,
    get_indexer_client,
    deploy,
    Account,
)
from algopy import Asset
from .contract import IssueEscrow


def deploy_issue_escrow(
    algod_client,
    indexer_client,
    app_spec: ApplicationSpecification,
    deployer: Account,
    usdc_asset_id: int = 0,  # Will be set to actual USDC asset ID
) -> None:
    """Deploy the IssueEscrow contract"""
    
    # Get deployer account
    deployer_account = get_account(algod_client, deployer)
    
    # Deploy the contract
    deploy_result = deploy(
        algod_client,
        app_spec,
        deployer_account,
        template_values={
            "usdc_asset_id": usdc_asset_id,
        }
    )
    
    print(f"Deployed IssueEscrow contract at: {deploy_result.app_id}")
    return deploy_result


if __name__ == "__main__":
    # This will be called during deployment
    algod_client = get_algod_client()
    indexer_client = get_indexer_client()
    
    # Load the app spec
    app_spec = ApplicationSpecification.from_json("contract.json")
    
    # Deploy with default deployer
    deployer = get_account(algod_client)
    deploy_issue_escrow(algod_client, indexer_client, app_spec, deployer)

