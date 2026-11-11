# Airport Search with Autocomplete

Angular 21 standalone app implementing a single airport autocomplete input.

## Stack

Angular 21 (standalone components) + TypeScript + RxJS + Angular `HttpClient`. Chosen because the project was already scaffolded as an Angular CLI app, and the task explicitly asks for a reactive `FormControl` and RxJS (`debounceTime`, `distinctUntilChanged`, `switchMap`). Plain HTML/CSS only — no UI or autocomplete libraries.

## How to run

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm start
```

(or `ng serve`)

Opens at `http://localhost:4200/`.

Run unit tests:

```bash
npm test
```

Production build:

```bash
npm run build
```

## How the autocomplete avoids filtering on every keystroke

The input's `valueChanges` observable is piped through `debounceTime(250)` and `distinctUntilChanged()` before `switchMap` calls `AirportLookup.search`. `debounceTime` waits until the user pauses typing for ~250 ms, so rapid keystrokes collapse into a single filter pass, and `distinctUntilChanged` skips work when the value hasn't actually changed. This matters for performance and UX: it avoids redundant filtering/layout on every keystroke, reduces jank on large datasets, and prevents stale intermediate results from flickering in the dropdown.

## Keeping keyboard navigation in sync with mouse hover

Both interactions update one shared piece of state, `activeIndex`. Arrow keys increment/decrement it (clamped to the list bounds) and `mouseenter` on an item sets it directly to that item's index. Because there is a single source of truth, the visually focused item (`.focused` class driven by `i === activeIndex`) always reflects either the last keyboard move or the last hover, whichever happened most recently. `mousedown` on items is prevented so the input keeps focus and clicks still register.

## If we supported 10,000 airports instead of 34

The first change would be to move filtering off the main thread / avoid O(n) scans per query — e.g. build an inverted index (or use a small search index) and only slice the top 5, or push the filtering into a Web Worker. With 10k rows the current linear `filter` + `slice` would still run, but debounce + a precomputed lowercase index keeps it responsive; the single biggest win is precomputing lowercased code/city and indexing.

## Known limitations

- No outside-click handling beyond a document click listener; very fast interactions could race, but selection uses `mousedown` prevention to stay reliable.
- `activeIndex` defaults to the first result on each new result set, which may not match a user's expectation of "no focus until arrow key".
- No ARIA live region / full screen-reader polish; basic `role`/`aria-*` attributes are present.
- Airports are loaded from `/assets/airports.json`; if the file is missing the dropdown shows "No airports match".
- No highlighting of the matched substring within items.
- Cache uses `shareReplay` with `refCount`; an errored load clears the cache so a retry is possible, but in-flight dedup is basic.
