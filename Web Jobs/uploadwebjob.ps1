Write-Output "Getting Azure storage context..."
   $storageContext = New-AzureStorageContext  -StorageAccountName "< storage account name>" -StorageAccountKey "< your key here >"

$ProgressPreference="SilentlyContinue"
   Set-AzureStorageBlobContent -Blob 'source.txt' -File 'D:\home\FileIn.txt' -Container '< container name >' -Context $storageContext  -Force
   Write-Output "Copied HTML file to Azure blob storage."