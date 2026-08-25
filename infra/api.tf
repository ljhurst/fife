locals {
  lasso_issuer = "https://zzspanxrc7v4tvou4acvdq36oi0yjdrz.lambda-url.us-east-1.on.aws/"
}

# HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "fife-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
  }
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "prod"
  auto_deploy = true
}

# JWT authorizer backed by Lasso
resource "aws_apigatewayv2_authorizer" "lasso" {
  api_id           = aws_apigatewayv2_api.main.id
  name             = "lasso-jwt"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [aws_apigatewayv2_stage.prod.invoke_url]
    issuer   = local.lasso_issuer
  }
}

# Integrations
resource "aws_apigatewayv2_integration" "espp_lot_create" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.espp_lot_create.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "espp_lot_get" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.espp_lot_get.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "espp_lot_delete" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.espp_lot_delete.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "user_get" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.user_get.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "user_update" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.user_update.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "user_espp_lot_list" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.user_espp_lot_list.invoke_arn
  payload_format_version = "2.0"
}

# Routes
resource "aws_apigatewayv2_route" "espp_lot_post" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /espp/lot"
  target             = "integrations/${aws_apigatewayv2_integration.espp_lot_create.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.lasso.id
}

resource "aws_apigatewayv2_route" "espp_lot_id_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /espp/lot/{lotId}"
  target             = "integrations/${aws_apigatewayv2_integration.espp_lot_get.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.lasso.id
}

resource "aws_apigatewayv2_route" "espp_lot_id_delete" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /espp/lot/{lotId}"
  target             = "integrations/${aws_apigatewayv2_integration.espp_lot_delete.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.lasso.id
}

resource "aws_apigatewayv2_route" "user_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /user"
  target             = "integrations/${aws_apigatewayv2_integration.user_get.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.lasso.id
}

resource "aws_apigatewayv2_route" "user_put" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /user"
  target             = "integrations/${aws_apigatewayv2_integration.user_update.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.lasso.id
}

resource "aws_apigatewayv2_route" "user_espp_lot_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /user/espp-lot"
  target             = "integrations/${aws_apigatewayv2_integration.user_espp_lot_list.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.lasso.id
}

# Lambda permissions
resource "aws_lambda_permission" "espp_lot_create" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.espp_lot_create.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "espp_lot_get" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.espp_lot_get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "espp_lot_delete" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.espp_lot_delete.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "user_get" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "user_update" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_update.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "user_espp_lot_list" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_espp_lot_list.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
