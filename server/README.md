# Modeler ( server )

## Requirements

```
$ rustup install nightly
```

- macOS ( ARM64 )

## Database

```
$ make up
```

## Database Migration

setup

```
$ docker compose exec diesel diesel setup
```

new migration

```
$ docker compose exec diesel diesel migration generate {table}
```

run migration

```
$ docker compose exec diesel diesel migration run
```
