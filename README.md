# github-beekeeper-chat
This sends messages to ChatsV2 on Beekeeper from Github Actions.

## Usage
```
      - uses: beekpr/github-beekeeper-chat@v1
        with:
          tenant: testingf.dev.beekeeper.io
          apikey: ${{ secrets.BKPR_TOKEN }}
          chat: bf5ad8d4-b7b5-45d6-9f0e-0f10bc6bbc54
          message: |
            Hello from GitHub CI - the usual RTF rules apply here
          files: file_to_attach.txt
```

## Development
```
npm run all
```
should update both the dist files (which get committed) and also run the tests (which are fairly basic at this point).