# slimplate cms

This is an example project using [vite](https://vitejs.dev/) & [react](https://reactjs.org/) with the UI in [tailwind](https://tailwindcss.com/)/[flowbite](https://flowbite.com/).

Think of this as the central CMS admin for a bunch of [slimplate](https://github.com/slimplate) sites you have in github. It allows you to keep your content in github, and edit it, without a server-side component (you still need a CORS proxy, but that is it.)

If you just have only 1 site you want to manage, or want per-site inline editing, check out [template-admin](https://github.com/slimplate/template-next), which is very similar, but setup on a single-site admin sort of workflow. You can also combine these ideas, for a central admin, and per-site CMS's for each site.


## setup

Deploy [cfghserver](https://github.com/slimplate/cfghserver) on cloudflare, or similar to [this](https://github.com/slimplate/template-next/tree/main/pages/api) on vercel. it has a little setup in the README. This will handle github authentication & provide a CORS proxy.

Install deps with `npm i`

Add a line to .env that points to it:

```
VITE_GITHUB_BACKEND=https://mycfghserver.gummicube.workers.dev
```

Test locally with `npm start`

Deploy with `npm run deploy`.

TODO

- publish all the seperate modules in slimplate monorepo with build and stuff setup
- get this site working with all those modules
- add a router so each admin thing is on a speerate page
- clean up config for default demo setup