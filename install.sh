# Resourse Group
resourceGroupName="NoteMarket"
# Region
region="westeurope"
# Database
databaseName="notemarket-db"
# Cognitive Service
cognitiveServiceName="notemarket-cs"
# Storage Account
storageAccountName="notemarket"
storageContainerName="container"
# Function App
planFunctionName="functionplan$RANDOM"
storageFunctionName="functionstorage$RANDOM"
functionAppName="functionapp$RANDOM"

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

echo "Getting MongoDB endpoint..."
buffer=$(az cosmosdb keys list \
	--type connection-strings \
	--name $databaseName \
	--resource-group $resourceGroupName)
databaseEndpoint=$(echo $buffer | jq '.connectionStrings[0].connectionString')
echo "MongoDB endpoint obtained!"

echo "Creating cognitive service..."
az cognitiveservices account create \
    --name $cognitiveServiceName \
    --resource-group $resourceGroupName \
    --kind TextAnalytics \
    --sku F0 \
    --location westus2 \
    --yes
echo "Cognitive service created!"

echo "Getting Cognitive Service endpoint..."
buffer=$(az cognitiveservices account show \
	-n $cognitiveServiceName \
	-g $resourceGroupName)
cognitiveServiceEndpoint=$(echo $buffer | jq '.properties.endpoint')
echo "Cognitive Service endpoint obtained!"

echo "Getting Cognitive Service key..."
buffer=$(az cognitiveservices account keys list \
	--name $cognitiveServiceName \
	--resource-group $resourceGroupName)
cognitiveServiceKey=$(echo $buffer | jq '.key1')
echo "Cognitive Service key obtained!"

echo "Generating /Serverless/.env file"
buffer=$(rm Serverless/.env)
printf "# Config database\n" >> 'Serverless/.env'
printf "MONGO_URI=%s\n" $databaseEndpoint >> 'Serverless/.env'
printf "\n" >> 'Serverless/.env'
printf "# Config sentiment analysis\n" >> 'Serverless/.env'
printf "LANGUAGE_ENDPOINT=%s\n" $cognitiveServiceEndpoint >> 'Serverless/.env'
printf "LANGUAGE_KEY=%s\n" $cognitiveServiceKey >> 'Serverless/.env'
echo "/Serverless/.env file generated!"

echo "Zipping functions..."
cd Serverless
buffer=$(rm serverless.zip)
npm i
zip -r serverless.zip .
rm -rf node_modules
cd ..
echo "Functions zipped!"

echo "Creating App Service plan..."
az appservice plan create \
	-g $resourceGroupName \
	-n $planFunctionName \
	--location $region \
	--sku B1

az storage account create \
  --name $storageFunctionName \
  --location $region \
  --resource-group $resourceGroupName \
  --sku Standard_LRS
echo "App Service plan created!"

echo "Creating Function App..."
az functionapp create \
	-p $planFunctionName \
	--name $functionAppName \
	--os-type Windows \
	--resource-group $resourceGroupName \
	--runtime node \
	--functions-version 3 \
	--disable-app-insights true \
	--storage-account $storageFunctionName

az functionapp config set \
	--always-on false \
	--name $functionAppName \
	--resource-group $resourceGroupName

az appservice plan update \
	--name $planFunctionName \
	--resource-group $resourceGroupName \
	--sku F1

az functionapp deployment source config-zip \
	-g $resourceGroupName \
	-n $functionAppName \
	--src ./Serverless/serverless.zip
echo "Function App created!"

echo "Getting key of all Azure Functions..."
# checkout
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name checkout)
checkoutKey=$(echo $buffer | jq '.default')
# getCatalog
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name getCatalog)
getCatalogKey=$(echo $buffer | jq '.default')
# getItem
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name getItem)
getItemKey=$(echo $buffer | jq '.default')
# getItemsToApprove
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name getItemsToApprove)
getItemsToApproveKey=$(echo $buffer | jq '.default')
# initDatabase
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name initDatabase)
initDatabaseKey=$(echo $buffer | jq '.default')
# login
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name login)
loginKey=$(echo $buffer | jq '.default')
# postComment
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name postComment)
postCommentKey=$(echo $buffer | jq '.default')
# registration
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name registration)
registrationKey=$(echo $buffer | jq '.default')
# reviewItem
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name reviewItem)
reviewItemKey=$(echo $buffer | jq '.default')
# uploadItem
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name uploadItem)
uploadItemKey=$(echo $buffer | jq '.default')
echo "Key of all functions obtained!"

echo "Creating Storage Account..."
az storage account create \
    -n $storageAccountName \
    -g $resourceGroupName \
    -l $region \
    --sku Standard_LRS
echo "Storage account created!" 

buffer=$(az storage account show-connection-string \
	-g $resourceGroupName \
	-n $storageAccountName)
storageAccountConnectionString=$(echo $buffer | jq ".connectionString")

echo "Creating storage container..."
az storage container create \
	-n $storageContainerName \
	--connection-string $storageAccountConnectionString \
	--public-access blob
echo "Storage container created!"

end=$(date +%Y-%m-%dT%H:%MZ -d "$DATE + $1 day")
echo "Generating storage account sas..."
storageAccountSaas=$(az storage account generate-sas \
	--services b \
	--permissions acdlrw \
	--resource-types sco \
	--expiry $end \
	--connection-string $storageAccountConnectionString)
echo "Storage account saas generated!"

