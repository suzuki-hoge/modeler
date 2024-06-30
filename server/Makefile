#
# cargo
#

run:
	@cargo run

check:
	@RUSTFLAGS="-A dead_code" cargo check

build:
	@cargo build --release

test:
	@cargo test

fix:
	@cargo +nightly fmt
	@cargo fix --allow-dirty --allow-staged
	@cargo clippy --fix --allow-dirty --allow-staged
	@cargo test

#
# docker
#

up:
	@docker compose up --detach --build

down:
	@docker compose down
