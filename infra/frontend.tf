locals {
  site_domain = "fife.bylukehurst.com"
}

module "site" {
  source = "git::https://github.com/ljhurst/stych.git//infra/modules/static-site?ref=v1.6.0"

  bucket_name     = "lj-fife"
  domain_name     = local.site_domain
  directory_index = true

  # Alpine.js compiles its directive expressions with the Function constructor, which needs unsafe-eval.
  content_security_policy = join("; ", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self' ${aws_apigatewayv2_api.main.api_endpoint} ${trimsuffix(local.lasso_issuer, "/")}",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ])
}

moved {
  from = aws_s3_bucket.static_site
  to   = module.site.aws_s3_bucket.this
}

moved {
  from = aws_s3_bucket_policy.static_site
  to   = module.site.aws_s3_bucket_policy.this
}

moved {
  from = aws_cloudfront_distribution.static_site
  to   = module.site.aws_cloudfront_distribution.this
}
