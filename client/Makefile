run:
	@yarn dev

test:
	@yarn test

fix:
	@yarn format
	@yarn lint
	@yarn test
	@grep -r '@/app/_flow' src/app/_manage || true
	@grep -r '@/app/_flow' src/app/\(page\)/\(auth\)/\(manage\) || true
	@grep -r '@/app/_manage' src/app/_flow || true
	@grep -r '@/app/_manage' src/app/\(page\)/\(auth\)/\(flow\) || true

sb:
	@yarn storybook
