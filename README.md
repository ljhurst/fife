# FiFE 🪈

Finance for Everyone

## Website

<http://lj-fife.s3-website-us-east-1.amazonaws.com>

## Features

### Work

#### 401k

- Enter 401k details and see contribution percent needed to maximize contributions

#### ESPP

- Upload your past ESPP purchases
- Enter current market value for stock price
- See tax considerations for any scenario

#### ESPP

- Calculate paychecks remaining for the year

## Local Development

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

## Tech Stack

- [Astro](https://astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [HTML](https://developer.mozilla.org/en-US/docs/Glossary/HTML5)
- Styling via [Bulma](https://bulma.io/)
- Hosted on [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)
