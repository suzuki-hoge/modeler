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
	@docker compose down --volumes

#
# diesel
#

db-run:
	@docker compose exec diesel diesel migration run

db-clear:
	@find migrations -name down.sql | sort -r | xargs -Ifile cat file | xargs -Iquery docker compose exec -T db mysql -u app -ppassword modeler -e "query"
	@docker compose exec db mysql -u app -ppassword modeler -e "drop table __diesel_schema_migrations"
	@docker compose exec diesel diesel migration run
