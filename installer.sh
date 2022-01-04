# Resourse Group name
resourceGroupName="NoteMarket"
# Region
region="westeurope"
# Database name
databaseName="notemarket-db"
# Cognitive Service name
cognitiveServiceName="notemarket-cs"

echo "Creating resource group..."
az group create -l $region -n $resourceGroupName
echo "NoteMarket resouce group created!"

echo "Creating CosmosDB database..."
az cosmosdb create \
    -n $databaseName \
    -g $resourceGroupName \
    --kind MongoDB \
    --server-version '4.0' \
    --default-consistency-level Eventual \
    --enable-automatic-failover true \
    --locations regionName=$region failoverPriority=0 isZoneRedundant=False \
    --locations regionName='East US 2' failoverPriority=1 isZoneRedundant=False
echo "CosmosDB database created!"

echo "Creating cognitive service..."
az cognitiveservices account create \
    --name $cognitiveServiceName \
    --resource-group $resourceGroupName \
    --kind TextAnalytics \
    --sku F0 \
    --location westus2 \
    --yes
echo "Cognitive service created!"