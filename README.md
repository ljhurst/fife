# FiFE 🪈

Finance for Everyone

## Website

<https://d3de9r2gorcf05.cloudfront.net/>

## Features

### Work

#### 401k

- Enter 401k details and see contribution percent needed to maximize contributions

#### ESPP

- Upload your past ESPP purchases
- Enter current market value for stock price
- See tax considerations for any scenario

#### Paycheck

- Calculate paychecks remaining for the year

## UI

### Framework

The app is built with [Astro](https://astro.build/). Run locally with

```bash
npm run dev
```

### Developer Experience

#### Unit Tests

We use [Vitest](https://vitest.dev/) for unit tests. Unit tests are in `test/unit`

```bash
npm run test
```

Code coverage can be viewed by opening `coverage/index.html` in the browser

#### Formatting

We use [Prettier](https://prettier.io/) for formatting

```bash
npm run format
```

#### Linting

We use [ESLint](https://eslint.org/) for linting

```bash
npm run lint:fix
```

#### Preflight

There is a helper command to do all of the above steps

```bash
npm run preflight
```

## API

### Framework

The API uses Go Lambdas behind and API gateway.
Each API route has its own `main.go` under `cmd/`.
Those use shared code under `pkg/` and are compiled into binaries under `bin/`.
The binaries are uploaded to the lambda functions.

First create the zip files

```bash
make lambda-packages
```

Then log into the console and upload each zip file to its appropriate Lambda function

### Developer Experience

#### Code Conventions

Code conventions are enforced via [pre-commit](https://pre-commit.com/).
To install the git hooks run:

```bash
pre-commit install
```

Then make sure everything is working with

```bash
pre-commit run --all-files
```

#### Unit Tests

We use [Go Test](https://pkg.go.dev/cmd/go#hdr-Test_packages) for unit tests

```bash
go test ./...
```

Code coverage can be viewed by opening `coverage.html`

#### Formatting

We use [Gofmt](https://pkg.go.dev/cmd/gofmt) for formatting

```bash
go fmt ./...
```

#### Linting

We use [Vet](https://pkg.go.dev/cmd/vet@go1.24.4) for linting

```bash
go vet ./...
```

#### Preflight

There is a helper command to do all the above steps

```bash
make preflight
```

## Pull Request

### GitHub Actions

The `preflight` checks must pass before merging a pull request

See the [check runs](https://github.com/ljhurst/fife/actions/workflows/check.yml)

## Deploy

### GitHub Actions

The app is hosted on [AWS S3](https://aws.amazon.com/s3/).
Deployment is handled by [GitHub Actions](https://github.com/features/actions)

See the workflow steps in `.github/workflows/deploy.yml`

See [deployment runs](https://github.com/ljhurst/fife/actions)

### AWS Credentials

GitHub Actions authenticates via OIDC (no stored AWS access keys). Each
workflow assumes a scoped IAM role:

- Frontend deploy: `fife-github-actions-frontend-deploy`
- Backend deploy: `fife-github-actions-backend-deploy`

The role ARNs are stored as repository variables
(`AWS_FRONTEND_DEPLOY_ROLE_ARN`, `AWS_BACKEND_DEPLOY_ROLE_ARN`) and read in
`.github/workflows/deploy.yml`. Both deploy jobs can also be run manually via
`workflow_dispatch` from the Actions tab.

For local Terraform access, use IAM Identity Center instead of a static IAM
user:

```bash
aws sso login --profile fife-deploy
AWS_PROFILE=fife-deploy terraform plan
```

(One-time setup: `aws configure sso` to create the `fife-deploy` profile,
pointed at the `fife-deploy` permission set.)

### Infrastructure as Code

Infrastructure is managed by [Terraform](https://www.terraform.io/).

Go to `infra/` and initialize Terraform:

```bash
cd infra/
terraform init
```

Review the planned changes:

```bash
terraform plan
```

Apply the changes:

```bash
terraform apply
```

When making changes to the infrastructure be sure to format and validate:

```bash
terraform fmt
terraform validate
```

## Tech Stack

- [Astro](https://astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [HTML](https://developer.mozilla.org/en-US/docs/Glossary/HTML5)
- Styling via [Bulma](https://bulma.io/)
- Hosted with [AWS CloudFront](https://aws.amazon.com/cloudfront/) on [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)
- User auth via [AWS Cognito](https://aws.amazon.com/cognito/)
