# REST API
resource "aws_api_gateway_rest_api" "main" {
  name = "fife-api"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Resources (Routes)
resource "aws_api_gateway_resource" "espp" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "espp"
}

resource "aws_api_gateway_resource" "espp_lot" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.espp.id
  path_part   = "lot"
}

resource "aws_api_gateway_resource" "espp_lot_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.espp_lot.id
  path_part   = "{lotId}"
}

resource "aws_api_gateway_resource" "user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "user"
}

resource "aws_api_gateway_resource" "user_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.user.id
  path_part   = "{userId}"
}

resource "aws_api_gateway_resource" "user_espp_lot" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.user_id.id
  path_part   = "espp-lot"
}

# POST /espp/lot - Create ESPP Lot
resource "aws_api_gateway_method" "espp_lot_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.espp_lot.id
  http_method   = "POST"
  authorization = "NONE"

  request_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration" "espp_lot_post" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.espp_lot.id
  http_method             = aws_api_gateway_method.espp_lot_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.espp_lot_create.invoke_arn
  content_handling        = "CONVERT_TO_TEXT"
}

resource "aws_api_gateway_method_response" "espp_lot_post_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot.id
  http_method = aws_api_gateway_method.espp_lot_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "espp_lot_post_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot.id
  http_method = aws_api_gateway_method.espp_lot_post.http_method
  status_code = aws_api_gateway_method_response.espp_lot_post_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# OPTIONS /espp/lot - CORS
resource "aws_api_gateway_method" "espp_lot_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.espp_lot.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "espp_lot_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot.id
  http_method = aws_api_gateway_method.espp_lot_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "espp_lot_options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot.id
  http_method = aws_api_gateway_method.espp_lot_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration_response" "espp_lot_options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot.id
  http_method = aws_api_gateway_method.espp_lot_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.espp_lot_options]
}

# GET /espp/lot/{lotId} - Get ESPP Lot
resource "aws_api_gateway_method" "espp_lot_id_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.espp_lot_id.id
  http_method   = "GET"
  authorization = "NONE"

  request_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration" "espp_lot_id_get" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.espp_lot_id.id
  http_method             = aws_api_gateway_method.espp_lot_id_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.espp_lot_get.invoke_arn
  content_handling        = "CONVERT_TO_TEXT"
}

resource "aws_api_gateway_method_response" "espp_lot_id_get_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot_id.id
  http_method = aws_api_gateway_method.espp_lot_id_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "espp_lot_id_get_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot_id.id
  http_method = aws_api_gateway_method.espp_lot_id_get.http_method
  status_code = aws_api_gateway_method_response.espp_lot_id_get_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# DELETE /espp/lot/{lotId} - Delete ESPP Lot
resource "aws_api_gateway_method" "espp_lot_id_delete" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.espp_lot_id.id
  http_method   = "DELETE"
  authorization = "NONE"

  request_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration" "espp_lot_id_delete" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.espp_lot_id.id
  http_method             = aws_api_gateway_method.espp_lot_id_delete.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.espp_lot_delete.invoke_arn
  content_handling        = "CONVERT_TO_TEXT"
}

resource "aws_api_gateway_method_response" "espp_lot_id_delete_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot_id.id
  http_method = aws_api_gateway_method.espp_lot_id_delete.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "espp_lot_id_delete_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot_id.id
  http_method = aws_api_gateway_method.espp_lot_id_delete.http_method
  status_code = aws_api_gateway_method_response.espp_lot_id_delete_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# OPTIONS /espp/lot/{lotId} - CORS
resource "aws_api_gateway_method" "espp_lot_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.espp_lot_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "espp_lot_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot_id.id
  http_method = aws_api_gateway_method.espp_lot_id_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "espp_lot_id_options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot_id.id
  http_method = aws_api_gateway_method.espp_lot_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration_response" "espp_lot_id_options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.espp_lot_id.id
  http_method = aws_api_gateway_method.espp_lot_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.espp_lot_id_options]
}

# GET /user/{userId} - Get User
resource "aws_api_gateway_method" "user_id_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_id.id
  http_method   = "GET"
  authorization = "NONE"

  request_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration" "user_id_get" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.user_id.id
  http_method             = aws_api_gateway_method.user_id_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_get.invoke_arn
  content_handling        = "CONVERT_TO_TEXT"
}

resource "aws_api_gateway_method_response" "user_id_get_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.user_id_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "user_id_get_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.user_id_get.http_method
  status_code = aws_api_gateway_method_response.user_id_get_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# PUT /user/{userId} - Update User
resource "aws_api_gateway_method" "user_id_put" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_id.id
  http_method   = "PUT"
  authorization = "NONE"

  request_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration" "user_id_put" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.user_id.id
  http_method             = aws_api_gateway_method.user_id_put.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_update.invoke_arn
  content_handling        = "CONVERT_TO_TEXT"
}

resource "aws_api_gateway_method_response" "user_id_put_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.user_id_put.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "user_id_put_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.user_id_put.http_method
  status_code = aws_api_gateway_method_response.user_id_put_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# OPTIONS /user/{userId} - CORS
resource "aws_api_gateway_method" "user_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "user_id_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.user_id_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "user_id_options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.user_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration_response" "user_id_options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.user_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,PUT,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.user_id_options]
}

# GET /user/{userId}/espp-lot - List User ESPP Lots
resource "aws_api_gateway_method" "user_espp_lot_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_espp_lot.id
  http_method   = "GET"
  authorization = "NONE"

  request_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration" "user_espp_lot_get" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.user_espp_lot.id
  http_method             = aws_api_gateway_method.user_espp_lot_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_espp_lot_list.invoke_arn
  content_handling        = "CONVERT_TO_TEXT"
}

resource "aws_api_gateway_method_response" "user_espp_lot_get_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_espp_lot.id
  http_method = aws_api_gateway_method.user_espp_lot_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "user_espp_lot_get_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_espp_lot.id
  http_method = aws_api_gateway_method.user_espp_lot_get.http_method
  status_code = aws_api_gateway_method_response.user_espp_lot_get_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# OPTIONS /user/{userId}/espp-lot - CORS
resource "aws_api_gateway_method" "user_espp_lot_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_espp_lot.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "user_espp_lot_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_espp_lot.id
  http_method = aws_api_gateway_method.user_espp_lot_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "user_espp_lot_options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_espp_lot.id
  http_method = aws_api_gateway_method.user_espp_lot_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration_response" "user_espp_lot_options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_espp_lot.id
  http_method = aws_api_gateway_method.user_espp_lot_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.user_espp_lot_options]
}

# Lambda Permissions
resource "aws_lambda_permission" "espp_lot_create" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.espp_lot_create.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "espp_lot_get" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.espp_lot_get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "espp_lot_delete" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.espp_lot_delete.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "user_get" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "user_update" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_update.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "user_espp_lot_list" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_espp_lot_list.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Deployment and Stage
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = filesha1("${path.module}/api.tf")
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "prod"
}
