# ID Card Printer — A4 CNIC Layout Tool


A React web app (no backend, nothing ever leaves your browser) for printing
Pakistani CNIC-size ID cards on A4 paper at actual size — 10 cards per sheet.


**v0.1.0** · Developed by [Huzaifa Irfan](https://huzaifairfan.com/) · [hi@huzaifairfan.com](mailto:hi@huzaifairfan.com) · [GitHub](https://github.com/HuzaifaIrfan-Web/id-card-printer-app)


Last Updated on 2026-07-29
<hr />

## Web App Preview

https://id-print.web.app/


## 🎬 Demo

[▶️![Demo](https://img.youtube.com/vi/Sba7TPTY4/maxresdefault.jpg)](https://www.youtube.com/watch?v=Sba7TPTY4)



## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

To produce a static build you can host anywhere (Netlify, Vercel, GitHub
Pages, or just open the `dist/index.html` file):

```bash
npm run build
npm run preview   # to test the production build locally
```

## How to use it

1. **Build list** — upload a front image and a back image for an ID card,
   optionally label it, set how many copies you need, and add it to the
   list. Repeat for as many different people/cards as you like — they all
   get combined into the same print job, in order.
2. **Layout settings** — pick one of the six print modes and, if needed,
   adjust the card size (defaults to the standard CNIC/ID-1 size,
   85.6mm × 53.98mm) and the gap between cards.
3. **Preview & print** — review the generated A4 pages, then use the print
   button(s). The app opens your browser's normal print dialog.

## The six print modes

| Mode | What it does |
|---|---|
| **Duplex — long edge** | One print job. Fronts and backs are sent as alternating pages so your printer's automatic duplexer prints both sides, flipping on the long (vertical) edge — the usual default for portrait duplex. |
| **Duplex — short edge** | Same, but for printers whose duplex unit flips on the short (horizontal) edge. |
| **Manual duplex — long edge** | Two separate print runs: "Print all fronts", then flip the paper stack over its long edge (like turning a book page), reload, and "Print all backs". |
| **Manual duplex — short edge** | Same, but flipping over the short edge (like flipping a notepad page). |
| **Single side — fold left/right** | One single-sided print job. Each card's front and a mirrored back sit side by side. Cut the pair out and fold down the middle vertical line so the back lands directly behind the front. |
| **Single side — fold top/bottom** | Same idea, but front on top and mirrored back below, folding along the horizontal middle line. |

Duplex and manual modes fit **10 finished cards per A4 sheet** (a 2×5 grid:
2 × 85.6mm = 171.2mm wide, 5 × 53.98mm = 269.9mm tall, both well inside A4's
210mm × 297mm). Fold Left/Right also uses the full 5 rows (5 finished,
already double-sided cards per sheet, each row holding one front+back pair).
Fold Top/Bottom needs an even row count so fronts and backs pair up cleanly,
so it uses a 2×4 grid — 4 finished cards per sheet.

## Getting the physical size exactly right

Browsers can silently rescale pages when printing unless you tell them not
to. Every time you print from this app:

- **Paper size:** A4
- **Scale:** 100% / "Actual size" (turn off "Fit to page" / "Shrink to fit")
- **Margins:** None (the app already lays out its own margins so the cards
  land at the correct physical position on the sheet)
- **For duplex modes only:** turn on two-sided printing in the print dialog
  and match the flip edge (long/short) to the mode you picked in the app —
  the browser can't set this for you.

Print one test sheet on plain paper first and hold it up against a real
card before running your full batch or switching to card stock.

## Notes

- Card data (images, labels, counts) lives only in memory for the current
  browser tab — refreshing the page clears the list, so finish a batch
  before closing it.
- The default card size matches the standard ID-1 card format used for
  Pakistani CNICs (and most other national ID/credit cards). You can change
  it in Layout settings if you're printing a different card size.



# 📝 Documentation

# 📚 References

# 🤝🏻 Connect with Me

## Huzaifa Irfan

- 💬 Just want to say hi?
- 🚀 Have a project to discuss?
- 📧 Email me @: [hi@huzaifairfan.com](mailto:hi@huzaifairfan.com)
- 📞 Visit my Profile for other channels:

[![GitHub](https://img.shields.io/badge/Github-%23222.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/HuzaifaIrfan/)
[![Website](https://img.shields.io/badge/Website-%23222.svg?style=for-the-badge&logo=google-chrome&logoColor==%234285F4)](https://www.huzaifairfan.com)

# 📜 License

Licensed under the GPL3 License, Copyright 2026 Huzaifa Irfan. [LICENSE](LICENSE)
