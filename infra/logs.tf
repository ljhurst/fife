resource "aws_cloudwatch_log_group" "function" {
  for_each = local.functions

  name              = "/aws/lambda/${each.value}"
  retention_in_days = 7
}

moved {
  from = aws_cloudwatch_log_group.espp_lot_create
  to   = aws_cloudwatch_log_group.function["espp_lot_create"]
}

moved {
  from = aws_cloudwatch_log_group.espp_lot_delete
  to   = aws_cloudwatch_log_group.function["espp_lot_delete"]
}

moved {
  from = aws_cloudwatch_log_group.espp_lot_get
  to   = aws_cloudwatch_log_group.function["espp_lot_get"]
}

moved {
  from = aws_cloudwatch_log_group.user_espp_lot_list
  to   = aws_cloudwatch_log_group.function["user_espp_lot_list"]
}

moved {
  from = aws_cloudwatch_log_group.user_get
  to   = aws_cloudwatch_log_group.function["user_get"]
}

moved {
  from = aws_cloudwatch_log_group.user_update
  to   = aws_cloudwatch_log_group.function["user_update"]
}
