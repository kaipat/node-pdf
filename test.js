const fs = require("fs");
const path = require("path");
const TablePDF = require("./lib/tablePDF");

new TablePDF({
  title: "いましめる @Jeni",
  rows: require("./data.js").slice(0),
  rowConfig: [
    { width: "34", key: "_index_", title: "序号" },
    { width: "*", key: "pron", title: "Pron" },
    { width: "**", key: "spell", title: "Spell" },
    { width: "**", key: "excerpt", title: "Excerpt" },
    { width: "30", title: "D1" },
    { width: "30", title: "D2" },
    { width: "30", title: "D3" },
    { width: "30", title: "D4" },
    { width: "30", title: "D5" }
  ],
  output: path.resolve(__dirname, "output-1.pdf")
});

new TablePDF({
  title: "いましめる @Jeni",
  rows: require("./data.js").slice(0),
  rowConfig: [
    { width: "*", key: "spell", title: "Spell" },
    { width: "***", key: "excerpt", title: "Excerpt" }
  ],
  output: path.resolve(__dirname, "output-2.pdf")
});

