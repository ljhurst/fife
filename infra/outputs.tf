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

output "lambda_functions" {
  description = "Lambda function Names"
  value       = { for key, function in aws_lambda_function.this : key => function.function_name }
}

output "api_gateway_invoke_url" {
  description = "API Gateway invoke URL"
  value       = aws_apigatewayv2_stage.prod.invoke_url
}
