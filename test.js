const fs = require("fs");
const path = require("path");
const TablePDF = require("./lib/tablePDF");

const pdf = new TablePDF({
  rows: require("./data.js").slice(0),
  title: "いましめる @Jeni",
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
  ]
});

pdf.pipe(fs.createWriteStream(path.resolve(__dirname, "output.pdf")));
