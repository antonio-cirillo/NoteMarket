# Resourse Group name
resourceGroup="NoteMarket"
# Region
region=westeurope
# Database name
database="NoteMarketDB"
dbName="notemarket"

echo "Creating resource group..."
az group create -l $region -n $resourceGroup
echo "NoteMarket resouce group created!"

echo "Creating CosmosDB database..."
az cosmosdb database create --name NoteMarketDB --resourceGroup $database --db-name $dbName