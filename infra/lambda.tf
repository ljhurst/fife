resource "aws_lambda_function" "espp_lot_create" {
  function_name = "fife-espp-lot-create"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "hello.handler"
  runtime       = "provided.al2023"
  filename      = "placeholder.zip"
  architectures = ["arm64"]
  timeout       = 3
  memory_size   = 128

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_lambda_function" "espp_lot_delete" {
  function_name = "fife-espp-lot-delete"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "hello.handler"
  runtime       = "provided.al2023"
  filename      = "placeholder.zip"
  architectures = ["arm64"]
  timeout       = 3
  memory_size   = 128

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_lambda_function" "espp_lot_get" {
  function_name = "fife-espp-lot-get"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "hello.handler"
  runtime       = "provided.al2023"
  filename      = "placeholder.zip"
  architectures = ["arm64"]
  timeout       = 3
  memory_size   = 128

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_lambda_function" "user_espp_lot_list" {
  function_name = "fife-user-espp-lot-list"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "hello.handler"
  runtime       = "provided.al2023"
  filename      = "placeholder.zip"
  architectures = ["arm64"]
  timeout       = 3
  memory_size   = 128

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_lambda_function" "user_get" {
  function_name = "fife-user-get"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "hello.handler"
  runtime       = "provided.al2023"
  filename      = "placeholder.zip"
  architectures = ["arm64"]
  timeout       = 3
  memory_size   = 128

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_lambda_function" "user_update" {
  function_name = "fife-user-update"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "hello.handler"
  runtime       = "provided.al2023"
  filename      = "placeholder.zip"
  architectures = ["arm64"]
  timeout       = 3
  memory_size   = 128

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}
