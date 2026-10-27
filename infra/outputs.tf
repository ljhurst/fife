output "site_url" {
  description = "Where the frontend is served"
  value       = "https://${local.site_domain}/"
}

output "cname_target" {
  description = "Point a DNS-only CNAME for fife in Cloudflare at this hostname"
  value       = module.site.cname_target
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
