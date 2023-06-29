const fs = require("fs");
const path = require("path");
const TablePDF = require("./lib/tablePDF");

const pdf = new TablePDF({
  rows: require("./data.js").slice(0),
  rowConfig: [ 
    { width: "40", key: "_index_", title: "序号", justify: "center" },
    { width: "*", key: "pron", title: "Pron", justify: "center" },
    { width: "**", key: "spell", title: "Spell", justify: "center" },
    { width: "**", key: "excerpt", title: "Excerpt", justify: "center" },
    { width: "36", title: "D1", justify: "center" },
    { width: "36", title: "D2", justify: "center" },
    { width: "36", title: "D3", justify: "center" },
    { width: "36", title: "D4", justify: "center" },
    { width: "36", title: "D5", justify: "center" }
  ]
});

pdf.pipe(fs.createWriteStream(path.resolve(__dirname, "output.pdf")));