const fs = require("fs");
const path = require("path");
const TablePDF = require("./lib/tablePDF");

const pdf1 = new TablePDF({
  title: "いましめる @Jeni",
  rows: require("./data.js").slice(0),
  rowConfig: [
    { width: "34", key: "_index_", title: "序号", justify: "center" },
    { width: "*", key: "spell", title: "单词" },
    { width: "*", key: "pron", title: "发音" },
    { width: "**", key: "cixing", title: "词性" },
    { width: "**", key: "definitionCN", title: "中文释义" },
    { width: "**", key: "definitionEN", title: "日语释义" },
    { width: "***", key: "note", title: "笔记" },
    { width: "***", key: "_note_", title: "笔记空间", justify: "center" },
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

function formatData(list) {
  return list.map(item => ({
    _id: item._id,
    excerpt: item.excerpt,
    spell: item.spell,
    pron: item.pron,
    cixing: "自动·五段",
    definitionCN: "漂，浮",
    definitionEN: "物が液体の表面にある。物が空中にある。浮いている。",
    note: "<ol><li>物が液体の表面にある。物が空中にある。浮いている。</li><li>物が液体の表面にある。物が空中にある。浮いている。</li><li>物が液体の表面にある。物が空中にある。浮いている。</li><li>物が液体の表面にある。物が空中にある。浮いている。</li></ol>"
  }));
}



