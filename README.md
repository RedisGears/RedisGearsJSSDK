```bash
npm install
npm run build -w ./packages/sdk
cd packages/create
node .
cd ../../redis-gear
npm run start -- [--redis=redis://127.0.0.1:6379] [--watch]
```
