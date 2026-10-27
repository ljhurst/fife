locals {
  functions = {
    espp_lot_create    = "fife-espp-lot-create"
    espp_lot_delete    = "fife-espp-lot-delete"
    espp_lot_get       = "fife-espp-lot-get"
    user_espp_lot_list = "fife-user-espp-lot-list"
    user_get           = "fife-user-get"
    user_update        = "fife-user-update"
  }
}

resource "aws_lambda_function" "this" {
  for_each = local.functions

  function_name    = each.value
  role             = aws_iam_role.lambda_execution.arn
  handler          = "hello.handler"
  runtime          = "provided.al2023"
  filename         = "${var.lambda_package_dir}/${each.value}.zip"
  source_code_hash = filebase64sha256("${var.lambda_package_dir}/${each.value}.zip")
  architectures    = ["arm64"]
  timeout          = 3
  memory_size      = 128
}

moved {
  from = aws_lambda_function.espp_lot_create
  to   = aws_lambda_function.this["espp_lot_create"]
}

moved {
  from = aws_lambda_function.espp_lot_delete
  to   = aws_lambda_function.this["espp_lot_delete"]
}

moved {
  from = aws_lambda_function.espp_lot_get
  to   = aws_lambda_function.this["espp_lot_get"]
}

moved {
  from = aws_lambda_function.user_espp_lot_list
  to   = aws_lambda_function.this["user_espp_lot_list"]
}

moved {
  from = aws_lambda_function.user_get
  to   = aws_lambda_function.this["user_get"]
}

moved {
  from = aws_lambda_function.user_update
  to   = aws_lambda_function.this["user_update"]
}
