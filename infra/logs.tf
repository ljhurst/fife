resource "aws_cloudwatch_log_group" "espp_lot_create" {
  name              = "/aws/lambda/fife-espp-lot-create"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "espp_lot_delete" {
  name              = "/aws/lambda/fife-espp-lot-delete"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "espp_lot_get" {
  name              = "/aws/lambda/fife-espp-lot-get"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "user_espp_lot_list" {
  name              = "/aws/lambda/fife-user-espp-lot-list"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "user_get" {
  name              = "/aws/lambda/fife-user-get"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "user_update" {
  name              = "/aws/lambda/fife-user-update"
  retention_in_days = 7
}
