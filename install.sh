# Resourse Group
resourceGroupName="NoteMarket"
# Region
region="westeurope"
# Database
databaseName="notemarket-db$RANDOM"
# Cognitive Service
cognitiveServiceName="notemarket-cs$RANDOM"
# Storage Account
storageAccountName="notemarket$RANDOM"
storageContainerName="container$RANDOM"
# Function App
planFunctionName="functionplan$RANDOM"
storageFunctionName="functionstorage$RANDOM"
functionAppName="functionapp$RANDOM"

echo "Creating Resource Group..."
az group create -l $region -n $resourceGroupName
echo "Resouce Group created!"

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

echo "Creating Cognitive Service..."
az cognitiveservices account create \
    --name $cognitiveServiceName \
    --resource-group $resourceGroupName \
    --kind TextAnalytics \
    --sku F0 \
    --location westus2 \
    --yes
echo "Cognitive Service created!"

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

echo "Getting key of all Azure functions..."
# checkout
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name checkout)
checkoutKey=$(echo $buffer | jq -r '.default')
# getCatalog
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name getCatalog)
getCatalogKey=$(echo $buffer | jq -r '.default')
# getItem
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name getItem)
getItemKey=$(echo $buffer | jq -r '.default')
# getItemsToApprove
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name getItemsToApprove)
getItemsToApproveKey=$(echo $buffer | jq -r '.default')
# initDatabase
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name initDatabase)
initDatabaseKey=$(echo $buffer | jq -r '.default')
# login
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name login)
loginKey=$(echo $buffer | jq -r '.default')
# postComment
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name postComment)
postCommentKey=$(echo $buffer | jq -r '.default')
# registration
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name registration)
registrationKey=$(echo $buffer | jq -r '.default')
# reviewItem
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name reviewItem)
reviewItemKey=$(echo $buffer | jq -r '.default')
# uploadItem
buffer=$(az functionapp function keys list \
	-g $resourceGroupName \
	-n $functionAppName \
	--function-name uploadItem)
uploadItemKey=$(echo $buffer | jq -r '.default')
echo "Key of all Azure functions obtained!"

echo "Creating Storage Account..."
az storage account create \
    -n $storageAccountName \
    -g $resourceGroupName \
    -l $region \
    --sku Standard_LRS
echo "Storage Account created!" 

echo "Getting Storage Account connection string..."
buffer=$(az storage account show-connection-string \
	-g $resourceGroupName \
	-n $storageAccountName)
storageAccountConnectionString=$(echo $buffer | jq ".connectionString")
echo "Storage Account connection string obtained!"

echo "Creating Storage Container..."
az storage container create \
	-n $storageContainerName \
	--connection-string $storageAccountConnectionString \
	--public-access blob
echo "Storage Container created!"

echo "Please, insert Stripe public key:"
read stripePublicKey
echo "Please, insert Stripe private key:"
read stripePrivateKey

echo "Generating /Web App/.env file"
buffer=$(rm 'Web App'/.env)
printf "# Config\n" >> 'Web App/.env'
printf "YOUR_DOMAIN=http://localhost\n" >> 'Web App/.env'
printf "PORT=80" >> 'Web App/.env'
printf "\n" >> 'Web App/.env'
printf "# Config Azure function\n" >> 'Web App/.env'
printf "URL_FUNCTION_CHECKOUT=https://$functionAppName.azurewebsites.net/api/checkout?code=%s\n" $checkoutKey >> 'Web App/.env'
printf "URL_FUNCTION_GET_CATALOG=https://$functionAppName.azurewebsites.net/api/getCatalog?code=%s\n" $getCatalogKey >> 'Web App/.env'
printf "URL_FUNCTION_GET_ITEM=https://$functionAppName.azurewebsites.net/api/getItem?code=%s\n" $getItemKey >> 'Web App/.env'
printf "URL_FUNCTION_GET_ITEMS_TO_APPROVE=https://$functionAppName.azurewebsites.net/api/getItemsToApprove?code=%s\n" $getItemsToApproveKey >> 'Web App/.env'
printf "URL_FUNCTION_LOGIN=https://$functionAppName.azurewebsites.net/api/login?code=%s\n" $loginKey >>'Web App/.env'
printf "URL_FUNCTION_POST_COMMENT=https://$functionAppName.azurewebsites.net/api/postComment?code=%s\n" $postCommentKey >> 'Web App/.env'
printf "URL_FUNCTION_REGISTRATION=https://$functionAppName.azurewebsites.net/api/registration?code=%s\n" $registrationKey >> 'Web App/.env'
printf "URL_FUNCTION_REVIEW_ITEM=https://$functionAppName.azurewebsites.net/api/reviewItem?code=%s\n" $reviewItemKey >> 'Web App/.env'
printf "URL_FUNCTION_UPLOAD_ITEM=https://$functionAppName.azurewebsites.net/api/uploadItem?code=%s\n" $uploadItemKey >> 'Web App/.env'
printf "\n" >> 'Web App/.env'
printf "# Config Storage Account\n" >> 'Web App/.env'
printf "STORAGE_STRING_CONNECTION=%s\n" $storageAccountConnectionString >> 'Web App/.env'
printf "STORAGE_CONTAINER=%s\n" $storageContainerName >> 'Web App/.env'
printf "\n" >> 'Web App/.env'
printf "# Config Stripe\n" >> 'Web App/.env'
printf "STRIPE_PUBLIC_KEY=%s\n" $stripePublicKey >> 'Web App/.env'
printf "STRIPE_PRIVATE_KEY=%s\n" $stripePrivateKey >> 'Web App/.env'
echo "/Web App/.env file generated!"
