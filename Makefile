.PHONY: test coverage

cleanup:
	rm -rf ./build

compile: cleanup
	npm run compile
	node scripts/logContractSizes.js
	-tput bel

lint:
	npm run ethlint
	npm run eslint

lint-fix:
	npm run ethlint
	npm run eslint-fix

test:
	-npm test
	-tput bel

deploy:
	-npm run deploy
	-tput bel

deploy-kovan:
	make compile
	DEPLOYMENT_KEY=0xf9351ad000adeb0b7de92d97c4e6d324f61a8e9d33524e80e6ef0b3cfa7f936c ./node_modules/.bin/truffle migrate -s ASSERTIONS=1 --network kovan --reset
	tput bel

coverage:
	-npm run coverage
	-tput bel

ganache:
	bash ./scripts/runGanache.sh

check-size:
	node scripts/checkContractSize.js

ctest: compile test
