# Variables
LOCAL_GOOS ?= $(shell go env GOOS)
LOCAL_GOARCH ?= $(shell go env GOARCH)
LAMBDA_GOOS ?= linux
LAMBDA_GOARCH ?= arm64
BUILD_FLAGS ?= -ldflags="-s -w" -tags lambda.norpc

# Find all directories under cmd that contain a main.go file
CMD_DIRS := $(shell find cmd -type f -name "main.go" -exec dirname {} \;)
# Generate corresponding local binary paths (with platform suffix)
LOCAL_TARGETS := $(patsubst cmd/%,bin/local/fife-%, $(CMD_DIRS))
# Generate corresponding lambda binary paths
LAMBDA_TARGETS := $(patsubst cmd/%,bin/lambda/$(LAMBDA_GOARCH)/%, $(CMD_DIRS))

# Default target
.PHONY: all
all: build-local

# Build all binaries for local development
.PHONY: build-local
build-local: $(LOCAL_TARGETS)

# Build all binaries for AWS Lambda
.PHONY: build-lambda
build-lambda: $(LAMBDA_TARGETS)

# Rule to build each binary for local development
bin/local/fife-%: cmd/%/main.go
	@echo "Building local binary $@..."
	@mkdir -p $@
	@GOOS=$(LOCAL_GOOS) GOARCH=$(LOCAL_GOARCH) go build -o $@ $<

# Rule to build each binary for AWS Lambda as "bootstrap"
bin/lambda/$(LAMBDA_GOARCH)/%: cmd/%/main.go
	@echo "Building Lambda binary for $* ($(LAMBDA_GOARCH))..."
	@mkdir -p $(dir $@)
	@GOOS=$(LAMBDA_GOOS) GOARCH=$(LAMBDA_GOARCH) go build $(BUILD_FLAGS) -o $@/bootstrap $<

# Clean all binaries
.PHONY: clean
clean:
	@echo "Cleaning binaries..."
	@rm -rf bin/*

# Clean local binaries
.PHONY: clean-local
clean-local:
	@echo "Cleaning local binaries..."
	@rm -rf bin/local

# Clean lambda binaries
.PHONY: clean-lambda
clean-lambda:
	@echo "Cleaning Lambda binaries..."
	@rm -rf bin/lambda

# Create Lambda deployment packages
.PHONY: lambda-packages
lambda-packages: build-lambda
	@echo "Creating Lambda deployment packages for $(LAMBDA_GOARCH)..."
	@for dir in $(LAMBDA_TARGETS); do \
		(cd $$dir && zip -r function.zip bootstrap); \
		echo "Created package: $$dir/function.zip"; \
	done

# Run formatting
.PHONY: format
format:
	@echo "Running formatter..."
	@go fmt ./...

# Run linting
.PHONY: lint
lint:
	@echo "Running linter..."
	@go vet ./...

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	@go test ./... -v

# Run preflight
.PHONY: preflight
preflight: format lint test

# Show help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  build-local     - Build all binaries for local development (default)"
	@echo "  build-lambda    - Build all binaries for AWS Lambda"
	@echo "  lambda-packages - Build and create Lambda deployment packages"
	@echo "  clean           - Remove all binaries"
	@echo "  clean-local     - Remove local binaries"
	@echo "  clean-lambda    - Remove Lambda binaries"
	@echo "  format          - Run formatter"
	@echo "  lint            - Run linter"
	@echo "  test            - Run tests"
	@echo "  preflight       - Run format, lint, and test"
