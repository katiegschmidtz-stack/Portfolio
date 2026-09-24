# Portfolio

My personal product portfolio website, built with [Astro](https://astro.build).

## Preview the site on your computer

You only need to do steps 1 to 3 once.

1. **Install Node.js.** Go to https://nodejs.org and download the **LTS** version (22 or newer). Open the installer and click through it.
2. **Download this project.** On the GitHub page for this repo, click the green **Code** button, then **Download ZIP**. Unzip it somewhere easy to find, like your Desktop.
3. **Open a terminal in the project folder.**
   - **Mac:** open the **Terminal** app, type `cd ` (with a space after it), drag the unzipped folder into the Terminal window, then press **Enter**.
   - **Windows:** open the unzipped folder, click the address bar at the top, type `cmd` and press **Enter**.

   Then type this and press **Enter**. It downloads Astro and takes about a minute:

   ```
   npm install
   ```

4. **Start the preview.** Type this and press **Enter**:

   ```
   npm run dev
   ```

5. Open **http://localhost:4321** in your web browser. Leave the terminal window open while you look around. If you edit a file and save it, the page updates by itself.
6. To stop the preview, click the terminal window and press **Ctrl + C**.

## Where to edit things

| What you want to change | File |
| --- | --- |
| Your name, email, LinkedIn | `src/data/site.ts` |
| Prototype cards | `src/data/site.ts` (bottom half) |
| Home page wording | `src/pages/index.astro` |
| About page | `src/pages/about.astro` |
| Eval Builder case study | `src/content/case-studies/eval-builder.md` |
| Colours and fonts | `src/styles/global.css` |

## Add your resume

Save your resume as a PDF named exactly **`resume.pdf`** and put it in the **`public`** folder. Every "Resume" button on the site links to it.

## Add a new case study

1. Copy `src/content/case-studies/eval-builder.md` and give the copy a new name, for example `checkout-redesign.md`. The file name becomes the web address: `/case-studies/checkout-redesign`.
2. Change the details between the `---` lines at the top (title, summary, role, timeframe, tags).
   - `featured: true` puts it in the big slot on the home page. Only use this on one case study.
   - `order` sets the order: lower numbers come first.
   - `draft: true` hides it until you're ready.
3. Write the story below the second `---` line. Each line starting with `## ` becomes a section heading and appears in the "On this page" menu.

The purple dashed boxes are placeholder text. In Markdown, they're the lines starting with `>`. Delete them once you've written your real content.
