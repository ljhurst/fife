# FiFE  📈

Finance for Everyone

# Website

http://lj-fife.s3-website-us-east-1.amazonaws.com

# Features

## Work

### ESPP

- Upload your past ESPP purchases
- Enter current market value for stock price
- See tax considerations for any scenario

# Deploy Instructions

1. Build

	```bash
	npm run build
	```

1. Log in to AWS

	Go to [AWS](https://aws.com) and log in with root user email

1. Go to S3

	Find the `lj-fife` bucket

1. Upload files

	- `dist/*`

# Local Development

## Framework

The app is built with [Astro](https://astro.build/). Run locally with

```bash
npm run dev
```

## Developer Experience

### Unit Tests

We use [Vitest](https://vitest.dev/) for unit tests. Unit tests are in `test/unit`

```bash
npm run test
```

Code coverage can be viewed by opening `coverage/index.html` in the browser

### Formatting

We use [Prettier](https://prettier.io/) for formatting

```bash
npm run format
```

### Linting

We use [ESLint](https://eslint.org/) for linting

```bash
npm run lint:fix
```


### Preflight

There is a helper command to do all of the above steps

```bash
npm run preflight
```


# Tech Stack

- [Astro](https://astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [HTML](https://developer.mozilla.org/en-US/docs/Glossary/HTML5)
- Styling via [Bulma](https://bulma.io/)
- Hosted on [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)