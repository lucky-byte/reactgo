# Copyright (c) 2021 KrossIAM Project.
# https://github.com/krossdev/iam/blob/main/LICENSE
#
NAME ?= ReactGo
VERSION ?= $(shell git describe --tags 2>/dev/null | cut -c 2-)
BUILD_YEAR ?= $(shell date +%Y)
BUILD_DATE ?= $(shell date +%Y%m%d)

LDFLAGS ?= -s -w

# version information
LDFLAGS += -X main.Name=${NAME} -X main.Version=${VERSION}
LDFLAGS += -X main.BuildDate=${BUILD_DATE} -X main.BuildYear=${BUILD_YEAR}

# executable app name
APPNAME ?= reactgo

# sqlite json functions
TAGS ?= sqlite_json

all: build

# refresh web assets
web:
	rm -fr ./web
	cp -r ../web/build web

# build a production executable
build: web
	go build -ldflags='$(LDFLAGS)' -tags '${TAGS}' -o ${APPNAME}

# build a development executable
build-dev: web
	go build -ldflags='$(LDFLAGS)' -tags '${TAGS} dev' -o ${APPNAME}-dev

# startup development server with default args
dev: build-dev
	./${APPNAME}-dev -config .config/config.yaml -webfs osdir -mailfs osdir

# startup development server with customized args
run:
	go run -ldflags='$(LDFLAGS)' -tags '${TAGS} dev' . \
		-config .config/config.yaml -webfs osdir -mailfs osdir

# build a linux amd64 executable
linux: web
	GOOS=linux GOARCH=amd64 \
	go build -ldflags='$(LDFLAGS)' -tags '${TAGS}' -o ${APPNAME}-linux-amd64

	GOOS=linux GOARCH=amd64 \
	go build -ldflags='$(LDFLAGS)' -tags '${TAGS} dev' -o ${APPNAME}-linux-amd64-dev

# 生成 privacy.html 和 terms.html，需要安装 pandoc 工具
html: privacy.md terms.md
	pandoc privacy.md -f markdown -t html -s -o privacy.html
	pandoc terms.md -f markdown -t html -s -o terms.html

# run test
test:
	go test $(arg) ./test/...

# clean
clean:
	go clean

.PHONY: web build build-dev dev test all clean linux html
