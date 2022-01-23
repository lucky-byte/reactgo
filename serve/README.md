# ReactGo

React + Go template project.

## Build

```
./build.sh
```
# build

```
make build
```

This will generated `reactgo` executable file in current directory
when build successful.

## Web FrontEnd

Web FrontEnd is a individual React project inside `../web` directory,
go into that folder and run `yarn build`, then move generated `build`
folder to this directory and rename to `web`, like this:

```
mv ../web/build web
```
