param(
  [string]$StackName = "neuroforge-web-stack",
  [string]$ProjectName = "neuroforge-web",
  [string]$Region = "us-east-1",
  [string]$BucketName = "",
  [string]$PriceClass = "PriceClass_100",
  [string]$AcmArn = "",
  [string]$AltNames = ""
)

$ErrorActionPreference = "Stop"

$RootDir = (Resolve-Path "$PSScriptRoot\..\..\").Path
$AppDir = $RootDir
$TemplateDir = Join-Path $RootDir "infra/cloudfront"
$DistDir = Join-Path $AppDir "dist"

Write-Host "Building web app..."
Push-Location $AppDir
if (Test-Path package-lock.json) { npm ci } else { npm install }
npm run build
Pop-Location

$paramList = @(
  "ParameterKey=ProjectName,ParameterValue=$ProjectName",
  "ParameterKey=PriceClass,ParameterValue=$PriceClass"
)
if ($BucketName) { $paramList += "ParameterKey=BucketName,ParameterValue=$BucketName" }
if ($AcmArn) { $paramList += "ParameterKey=AcmCertificateArn,ParameterValue=$AcmArn" }
if ($AltNames) { $paramList += "ParameterKey=AlternativeDomainNames,ParameterValue=$AltNames" }

Write-Host "Deploying CloudFormation stack: $StackName in $Region"
aws cloudformation deploy `
  --template-file (Join-Path $TemplateDir "cloudfront-s3-website.yaml") `
  --stack-name $StackName `
  --region $Region `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides $paramList

Write-Host "Fetching outputs..."
$Bucket = aws cloudformation describe-stacks --stack-name $StackName --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='BucketNameOut'].OutputValue" --output text
$DistId = aws cloudformation describe-stacks --stack-name $StackName --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text
$DistDomain = aws cloudformation describe-stacks --stack-name $StackName --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text

Write-Host "Syncing dist to s3://$Bucket ..."
aws s3 sync $DistDir "s3://$Bucket/" --delete --cache-control "max-age=31536000,public" --exclude index.html
aws s3 cp (Join-Path $DistDir "index.html") "s3://$Bucket/index.html" --cache-control "no-cache,public" --content-type "text/html"

Write-Host "Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id $DistId --paths "/*"

Write-Host "Done. Deployed to: https://$DistDomain"
