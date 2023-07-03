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

  const setting = ctx.request.body.setting || [];
  console.log(setting);

  const pdf = new TablePDF({
    rows: fakeData,
    title: "いましめる @Jeni",
    rowConfig: [
      { width: "34", key: "_index_", title: "序号", justify: "center" },
      { width: "*", key: "pron", title: "Pron" },
      { width: "*", key: "spell", title: "Spell" },
      { width: "***", key: "excerpt", title: "Excerpt" },
      { width: "30", title: "D1", key: "_date_", justify: "center" },
      { width: "30", title: "D2", key: "_date_", justify: "center" },
      { width: "30", title: "D3", key: "_date_", justify: "center" },
      { width: "30", title: "D4", key: "_date_", justify: "center" },
      { width: "30", title: "D5", key: "_date_", justify: "center" }
    ].filter(cell => setting.includes(cell.key))
  });
  ctx.body = pdf.stream();
});

app.use(koaStatic(path.resolve(__dirname, "public")));

app.use(koaBody());

app.use(router.routes());

app.listen(3000, () => console.log("app running on http://localhost:3030"));
