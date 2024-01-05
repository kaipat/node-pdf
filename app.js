const path = require("path");
const Koa = require("koa");
const koaStatic = require("koa-static");
const { koaBody } = require("koa-body");
const KoaRouter = require( "@koa/router");
const TablePDF = require("./lib/tablePDF");
const fakeData = require("./data.js");

const app = new Koa();
const router = new KoaRouter();

router.post("/output", ctx => {
  ctx.set("Content-Type", "application/pdf");
  ctx.set("Content-Disposition", "attachment; filename=output.pdf");

  const setting = ctx.request.body.setting || {};
  const props = Object.keys(setting).filter(key => setting[key] === "true");

  const pdf = new TablePDF({
    rows: fakeData,
    title: "いましめる @Jeni",
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
    ].filter(cell => props.includes(cell.key)),
    pageConfig: {
      backgroundColor: setting.backgroundColor
    },
    cellConfig: {
      backgroundColor: ["#ffffff", setting.cellBackgroundColor]
    },
    headerConfig: {
      backgroundColor: setting.headerBackgroundColor
    }
  });
  ctx.body = pdf.stream();
});

app.use(koaStatic(path.resolve(__dirname, "public")));

app.use(koaBody());

app.use(router.routes());

app.listen(3030, () => console.log("app running on http://localhost:3030"));
