const fs = require("fs");
const path = require("path");
const TablePDF = require("./lib/tablePDF");

const pdf = new TablePDF({
  rows: require("./data.js").slice(0),
  rowConfig: [ 
    { width: "40", key: "_index_", title: "序号", justify: "center" },
    { width: "*", key: "pron", title: "Pron" },
    { width: "*", key: "spell", title: "Spell" },
    { width: "***", key: "excerpt", title: "Excerpt" },
    { width: "46", key: "_checkbox_", title: "日期1", justify: "center" },
    { width: "46", key: "_checkbox_", title: "日期2", justify: "center" },
    { width: "46", key: "_checkbox_", title: "日期3", justify: "center" },
    { width: "46", key: "_checkbox_", title: "日期4", justify: "center" },
    { width: "46", key: "_checkbox_", title: "日期5", justify: "center" }
  ]
});

pdf.pipe(fs.createWriteStream(path.resolve(__dirname, "output.pdf")));
