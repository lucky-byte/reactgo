# Kross IAM Server

## Build

```
./build.sh
```

This will generated `kross-iam` executable file in current directory
when build successful.

## Web FrontEnd

Web FrontEnd is a individual React project inside `../web` directory,
go into that folder and run `yarn build`, then move generated `build`
folder to this directory and rename to `web`, like this:

```
mv ../web/build web
```
