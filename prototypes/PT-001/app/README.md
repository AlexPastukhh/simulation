# PT-001 App

Disposable React/TypeScript/Vite UI for prototype PT-001.

## Data

The app does not own scenario data.

`npm run dev` and `npm run build` first execute:

```text
npm run sync-data
```

which copies:

```text
../data/stage_b.json
-> public/stage_b.json
```

`public/stage_b.json` is generated and gitignored.

## Views

- Event Stream + Event Inspector
- Entity Explorer
- Dynamics Compare

## Run

```text
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

## Technical checks

```text
npm run build
npm run lint
```

Validated prototype evidence belongs in the PT-001 documentation / VE records, not in this application README.
