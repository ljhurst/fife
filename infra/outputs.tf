output "s3_website_url" {
  description = "S3 website URL"
  value       = "http://${aws_s3_bucket_website_configuration.static_site.website_endpoint}"
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = "https://${aws_cloudfront_distribution.static_site.domain_name}"
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    users     = aws_dynamodb_table.users.name
    espp_lots = aws_dynamodb_table.espp_lots.name
  }
}

output "cognito_user_pool_endpoint" {
  description = "Cognito User Pool endpoint"
  value       = "https://${aws_cognito_user_pool.main.endpoint}"
}

output "lambda_functions" {
  description = "Lambda function Names"
  value = {
    espp_lot_create    = aws_lambda_function.espp_lot_create.function_name
    espp_lot_delete    = aws_lambda_function.espp_lot_delete.function_name
    espp_lot_get       = aws_lambda_function.espp_lot_get.function_name
    user_espp_lot_list = aws_lambda_function.user_espp_lot_list.function_name
    user_get           = aws_lambda_function.user_get.function_name
    user_update        = aws_lambda_function.user_update.function_name
  }
}

output "api_gateway_invoke_url" {
  description = "API Gateway invoke URL"
  value       = aws_api_gateway_stage.prod.invoke_url
}
