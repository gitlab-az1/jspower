yarn install
yarn build

rm -rf ./node_modules/
rm -rf ./src/
rm -rf ./.eslint*
rm -rf ./.gitignore
rm -rf ./babel.config.js
rm -rf ./jest.config.js
rm -rf ./post-build.js
rm -rf ./tsconfig.json
rm -rf ./yarn*

cd ./dist/
mv ./* ..
cd ..

rm -rf ./dist/
rm -rf ./package.json

mv ./pkg.jsonbuild ./package.json

npm publish