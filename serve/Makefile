NAME ?= ReactGo
VERSION ?= $(shell git describe --tags 2>/dev/null | cut -c 2-)
BUILD_YEAR ?= $(shell date +%Y)
BUILD_DATE ?= $(shell date +%Y%m%d)

LDFLAGS ?= -s -w

# 版本信息
LDFLAGS += -X main.Name=${NAME} -X main.Version=${VERSION}
LDFLAGS += -X main.BuildDate=${BUILD_DATE} -X main.BuildYear=${BUILD_YEAR}

# 执行文件名
EXECUTABLE ?= reactgo

# sqlite json functions
TAGS ?= sqlite_json

all: build

# 更新 web 文件
web:
	rm -fr ./web
	cp -r ../web/build web

# 构建生产版本执行文件
build: web
	go build -ldflags='$(LDFLAGS)' -tags '${TAGS}' -o ${EXECUTABLE}

# 构建开发版本执行文件
build-dev:
	go build -ldflags='$(LDFLAGS)' -tags '${TAGS} dev' -o ${EXECUTABLE}-dev

# 采用默认的参数启动开发服务器
dev: build-dev
	./${EXECUTABLE}-dev -config .config/config.yaml -webfs osdir -mailfs osdir

# 采用默认的参数启动开发服务器
run:
	go run -ldflags='$(LDFLAGS)' -tags '${TAGS} dev' . \
		-config .config/config.yaml -webfs osdir -mailfs osdir

# build a linux amd64 executable
linux: web
	GOOS=linux GOARCH=amd64 \
	go build -ldflags='$(LDFLAGS)' -tags '${TAGS}' -o ${EXECUTABLE}-linux-amd64

# run test
test:
	go test $(arg) ./test/...

# 清理
clean:
	go clean
	rm -f ${EXECUTABLE} ${EXECUTABLE}-dev ${EXECUTABLE}-linux-*

.PHONY: web build build-dev dev test all clean linux
