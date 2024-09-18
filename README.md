How to set up repo locally:

1. Clone and pull down the latest version of main
2. Run npm install in the root folder (might not be necessary but I forgor)
3. Run npm install in the client folder
4. Run amplify pull --appId d201kh2abos6az --envName dev in the root folder (if it fails, run npm install -g @aws-amplify/cli then try again)
5. Go through the default prompts, logging in when it asks you too (if you need a special code, ask Luke)
