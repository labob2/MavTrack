# Academic Ledger

A GPA, credit, and scholarship tracker.

## Run it locally (do this first)

You'll need Node.js installed (18 or newer). Check with:

    node -v

Then, from inside this folder:

    npm install
    npm run dev

That second command will print a local address, usually `http://localhost:5173`. Open that in your browser — this is your app, running on your own machine, nobody else can see it yet.

Your data is stored in this browser's `localStorage`, tied to this one browser on this one machine. Closing the terminal stops the local server, but your data stays saved for next time you run `npm run dev` again.

Deployment instructions (putting this on a real public URL) come next, once you've confirmed everything looks and works the way you want locally.
