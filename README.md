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

The API uses Go Lambdas behind and API gateway. Each API route has its own `main.go` under `cmd/`. Those use shared code under `pkg/` and are compiled into binaries under `bin/`. The binaries are uploaded to the the lambda functions

### Developer Experience

#### Unit Tests

We use [Go Test](https://pkg.go.dev/cmd/go#hdr-Test_packages) for unit tests

```bash
go test ./...
```

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

- IAM User: `fife-deploy-user`
- IAM Policy: `fife-deploy-policy`
- Access Method: `Access Keys`

## AWS Resources

### API Gateway

#### APIs

- `fife-api`

### Cognito

#### User Pools

- `fife-user-pool`

#### App Clients

- `fife-app-client`

### DynamoDB

#### Tables

- `fife-users`

### IAM

#### Users

- `fife-deploy-user`

#### Roles

- `fife-lambda-apigateway-role`

#### Policies

- `fife-lambda-apigateway-policy`
- `fife-deploy-policy`

### Lambda

#### Functions

- `fife-user-get`

### S3

#### Buckets

- `lj-fife`

## Tech Stack

- [Astro](https://astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [HTML](https://developer.mozilla.org/en-US/docs/Glossary/HTML5)
- Styling via [Bulma](https://bulma.io/)
- Hosted with [AWS CloudFront](https://aws.amazon.com/cloudfront/) on [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)
- User auth via [AWS Cognito](https://aws.amazon.com/cognito/)
