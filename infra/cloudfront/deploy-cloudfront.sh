#!/usr/bin/env bash
set -euo pipefail

# Deploy Vite React app to S3 + CloudFront via CloudFormation

STACK_NAME=${STACK_NAME:-neuroforge-web-stack}
PROJECT_NAME=${PROJECT_NAME:-neuroforge-web}
REGION=${AWS_REGION:-us-east-1}
BUCKET_NAME=${BUCKET_NAME:-}
PRICE_CLASS=${PRICE_CLASS:-PriceClass_100}
ACM_ARN=${ACM_ARN:-}
ALT_NAMES=${ALT_NAMES:-}

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
APP_DIR="$ROOT_DIR"
TEMPLATE_DIR="$ROOT_DIR/infra/cloudfront"
DIST_DIR="$APP_DIR/dist"

echo "Building web app..."
cd "$APP_DIR"
npm ci || npm install
npm run build

echo "Deploying CloudFormation stack: $STACK_NAME in $REGION"
PARAMS=(
  ParameterKey=ProjectName,ParameterValue="$PROJECT_NAME"
  ParameterKey=PriceClass,ParameterValue="$PRICE_CLASS"
)

if [[ -n "$BUCKET_NAME" ]]; then
  PARAMS+=(ParameterKey=BucketName,ParameterValue="$BUCKET_NAME")
fi
if [[ -n "$ACM_ARN" ]]; then
  PARAMS+=(ParameterKey=AcmCertificateArn,ParameterValue="$ACM_ARN")
fi
if [[ -n "$ALT_NAMES" ]]; then
  PARAMS+=(ParameterKey=AlternativeDomainNames,ParameterValue="$ALT_NAMES")
fi

aws cloudformation deploy \
  --template-file "$TEMPLATE_DIR/cloudfront-s3-website.yaml" \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides "${PARAMS[@]}"

echo "Fetching outputs..."
BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='BucketNameOut'].OutputValue" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
DIST_DOMAIN=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text)

echo "Syncing dist to s3://$BUCKET ..."
aws s3 sync "$DIST_DIR" "s3://$BUCKET/" --delete --cache-control max-age=31536000,public --exclude index.html
aws s3 cp "$DIST_DIR/index.html" "s3://$BUCKET/index.html" --cache-control no-cache,public --content-type text/html

echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"

echo "Done. Deployed to: https://$DIST_DOMAIN"
