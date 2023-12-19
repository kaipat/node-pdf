const fs = require("fs");
const path = require("path");
const TablePDF = require("./lib/tablePDF");

const pdf1 = new TablePDF({
  title: "いましめる @Jeni",
  rows: require("./data.js").slice(0),
  rowConfig: [
    { width: "34", key: "_index_", title: "序号", justify: "center" },
    { width: "*", key: "pron", title: "Pron" },
    { width: "*", key: "spell", title: "Spell" },
    { width: "****", key: "excerpt", title: "Excerpt" },
    { width: "30", key: "_date_", title: "D1", justify: "center" },
    { width: "30", key: "_date_", title: "D2", justify: "center" },
    { width: "30", key: "_date_", title: "D3", justify: "center" },
    { width: "30", key: "_date_", title: "D4", justify: "center" },
    { width: "30", key: "_date_", title: "D5", justify: "center" }
  ],
  pageConfig: {
    backgroundColor: "#94a3b8"
  },
  cellConfig: {
    backgroundColor: ["#ffffff", "#D8D8D8", "#fca5a5"]
  }
});
pdf1.file(path.resolve(__dirname, "./public/output-1.pdf"));

pdf2 = new TablePDF({
  title: "いましめる @Jeni",
  rows: require("./data.js").slice(0),
  rowConfig: [
    { width: "*", key: "spell", title: "Spell" },
    { width: "***", key: "excerpt", title: "Excerpt" }
  ],
  pageConfig: {
    backgroundColor: "#e2e8f0"
  }
});
pdf2.pipeline(fs.createWriteStream(path.resolve(__dirname, "./public/output-2.pdf")));

