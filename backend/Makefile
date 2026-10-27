# Variables
LOCAL_GOOS ?= $(shell go env GOOS)
LOCAL_GOARCH ?= $(shell go env GOARCH)

# Find all directories under cmd that contain a main.go file
CMD_DIRS := $(shell find cmd -type f -name "main.go" -exec dirname {} \;)
# Generate corresponding local binary paths (with platform suffix)
LOCAL_TARGETS := $(patsubst cmd/%,bin/local/fife-%, $(CMD_DIRS))

# Default target
.PHONY: all
all: build-local

# Build all binaries for local development
.PHONY: build-local
build-local: $(LOCAL_TARGETS)

# Rule to build each binary for local development
bin/local/fife-%: cmd/%/main.go
	@echo "Building local binary $@..."
	@mkdir -p $@
	@GOOS=$(LOCAL_GOOS) GOARCH=$(LOCAL_GOARCH) go build -o $@ $<

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

# Create Lambda deployment packages in dist/
.PHONY: lambda-packages
lambda-packages:
	@scripts/build_lambda.sh

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
	@go test ./... -coverprofile=coverage.out
	@go tool cover -html=coverage.out -o coverage.html
	@go tool cover -func=coverage.out

# Run preflight
.PHONY: preflight
preflight: format lint test

# Show help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  build-local     - Build all binaries for local development (default)"
	@echo "  lambda-packages - Build the reproducible Lambda zips in dist/"
	@echo "  clean           - Remove all binaries"
	@echo "  clean-local     - Remove local binaries"
	@echo "  format          - Run formatter"
	@echo "  lint            - Run linter"
	@echo "  test            - Run tests"
	@echo "  preflight       - Run format, lint, and test"
