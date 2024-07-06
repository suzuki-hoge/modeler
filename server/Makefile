#
# cargo
#

run:
	@RUSTFLAGS="-L/opt/homebrew/lib" cargo run

check:
	@RUSTFLAGS="-A dead_code" cargo check

test:
	@RUSTFLAGS="-L/opt/homebrew/lib" cargo test

fix:
	@cargo +nightly fmt
	@cargo fix --allow-dirty --allow-staged
	@cargo clippy --fix --allow-dirty --allow-staged
	@RUSTFLAGS="-L/opt/homebrew/lib" cargo test

#
# docker
#

up:
	@docker compose up --detach --build

down:
	@docker compose down
