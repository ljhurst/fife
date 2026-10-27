resource "aws_cloudwatch_log_group" "function" {
  for_each = local.functions

  name              = "/aws/lambda/${each.value}"
  retention_in_days = 7
}
