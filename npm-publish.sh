cleanup() {
  sleep 0.1

  cd ..
  rm -rf ./__build__/

  exit 0
}


rm -rf ./__build__/
mkdir ./__build__/

clear

git clone https://github.com/gitlab-az1/typesdk.git ./__build__/

cd ./__build__/

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

mv ./package.build.json ./package.json

npm publish --access public || cleanup

cleanup
