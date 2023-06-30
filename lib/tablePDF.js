const path = require("path");
const PDFKit = require("pdfkit");
const fs = require("fs");

module.exports = class TablePDF extends PDFKit {
  constructor(options = {}) {
    super({
      size: "A4",
      margin: 0,
      autoFirstPage: true
    });

    this.title = options.title;
    this.rows = options.rows || [];
    this.border = { width: 1, color: "#8B8787" };
    this.margin = { top: 50, left: 30, right: 30, bottom: 50 };
    this.rowConfig = options.rowConfig || [];
    this.headerConfig = {
      color: "#FFFFFF", backgroundColor: "#8B8787",
      fontSize: 11, font: "Regular", borderColor: "#FFFFFF"
    };
    this.cellConfig = {
      fontSize: 9, font: "Light",
      padding: { top: 5, left: 5, right: 5, bottom: 5 },
      justify: "center", align: "center",
      color: "#3A3A3A", backgroundColor: ["#ffffff", "#D8D8D8"]
    };

    this.registerFont(
      "Regular",
      path.resolve(
        __dirname,
        "fonts/AlibabaPuHuiTi/AlibabaPuHuiTi-Regular.otf"
      )
    );
    this.registerFont(
      "Light",
      path.resolve(
        __dirname,
        "fonts/AlibabaPuHuiTi/AlibabaPuHuiTi-Light.otf"
      )
    );
    this.font("Regular");

    options.output && this.pipe(fs.createWriteStream(options.output));

    this.addRows();

    this.end();
  }

  /**
   * 计算表格cell宽度
   * @param {Array<number|string|undefined>} widths - cell自定义初始宽度
   * @return {Array<number>}
   */
  calcCellsWidth(widths) {
    const pageWidth = this.page.width;
    const tableMargin = this.margin.left + this.margin.right;
    const symbolReg = /^\*+$/;

    widths = widths.map(width => {
      if (Number(width) >= 0) {
        return Number(width);
      } else if (symbolReg.test(width)) {
        return width;
      } else {
        return "*";
      }
    });

    const usedWidth =
      widths.reduce(
        (total, width) => width >= 0 ? total += width : total, 0);
    const remainingWidth = pageWidth - usedWidth - tableMargin;
    const rate = 1 / widths.filter(width => symbolReg.test(width)).join("").length;

    widths = widths.map(width => {
      if (width >= 0) {
        return width;
      } else {
        const allocatedWidth = width.length * rate * remainingWidth;
        return allocatedWidth > 0 ? allocatedWidth : 0;
      }
    });

    return widths;
  }

  /**
   * 获取表格行配置对象
   * @param {Object} rowConfig - 表格行配置对象
   * @param {Object} options - 可选参数 isHeader - 是否为header
   * @return {Object}
   */
  getRowConfig(rowConfig, options = {}) {
    rowConfig = JSON.parse(JSON.stringify(rowConfig));
    const widths = this.calcCellsWidth(rowConfig.map(cellConfig => cellConfig.width));
    const { padding, justify, align, color, backgroundColor, fontSize, font } = this.cellConfig;
    for (let index = 0; index < rowConfig.length; index++) {
      rowConfig[index].isHeader = options.isHeader || false;
      rowConfig[index].padding = padding;
      rowConfig[index].justify = rowConfig[index]["justify"] || justify;
      rowConfig[index].align = rowConfig[index]["align"] || align;
      rowConfig[index].font = options.isHeader ? this.headerConfig.font : font;
      rowConfig[index].fontSize = options.isHeader ? this.headerConfig.fontSize : fontSize;
      rowConfig[index].color = options.isHeader ? this.headerConfig.color : color;
      rowConfig[index].backgroundColor = options.isHeader ? this.headerConfig.backgroundColor : backgroundColor;
      rowConfig[index].width = widths[index];
      rowConfig[index].wrapWidth = widths[index] - padding.left - padding.right;
    }
    return rowConfig;
  }

  /**
   * 获取表格cell字体配置
   * @param {Object} cell - 单元格信息
   * @return {Object}
   */
  getCellTextConfig(cell) {
    return {
      baseline: "top",
      lineGap: 0,
      width: cell.wrapWidth
    };
  }

  /**
   * 获取表格cell字体x,y轴位置
   * @param {Object} cell - 单元格信息
   * @param {number} offsetX - 单元格信息
   * @param {number} offsetY - 单元格信息
   * @return {Object}
   */
  getCellTextPosition(cell, offsetX, offsetY ) {
    let x = offsetX + cell.padding.left;
    let y = offsetY + cell.padding.top;
    if (cell.justify === "center") {
      const innerWidth = cell.textWidth > cell.wrapWidth ? cell.wrapWidth : cell.textWidth;
      x = offsetX + (cell.width - innerWidth) / 2;
    }
    if (cell.align === "center") {
      y = offsetY + (cell.height - cell.textHeight) / 2;
    }
    return {
      x, y
    };
  }

  /**
   * 获取表格cell的背景色
   * @param {Object} cell - 单元格信息
   * @param {number} rowIndex - 行下标
   * @return string
   */
  getCellBackground(cell, rowIndex) {
    if (Array.isArray(cell.backgroundColor)) {
      const { length } = cell.backgroundColor;
      const colorIndex = (rowIndex + length - 1) % cell.backgroundColor.length;
      return cell.backgroundColor[colorIndex];
    } else {
      return cell.backgroundColor;
    }
  }

  /**
   * 绘制表格边框
   * @param {Array} rows - 一页的表格里的行
   * @param {number} offsetHeight - 表格高度
   */
  drawBorder(rows, offsetHeight) {
    const row = rows[0];

    this
      .save()
      .rect(
        this.margin.left,
        this.margin.top,
        row.reduce((previous, cell) => previous += cell.width, 0),
        offsetHeight
      )
      .strokeColor()
      .stroke(this.border.color)
      .restore();

    let offsetWidth = 0;
    row.forEach((cell, cellIndex) => {
      offsetWidth += cellIndex === 0 ? 0 : row[cellIndex - 1].width;

      const offsetX = this.margin.left + offsetWidth + cell.width;
      const offsetY = this.margin.top;

      if (cellIndex < row.length - 1) {
        this
          .save()
          .lineWidth(this.border.width)
          .moveTo(offsetX, offsetY)
          .lineTo(offsetX, offsetY + cell.height)
          .strokeColor(this.headerConfig.borderColor)
          .stroke()
          .restore();

        this
          .save()
          .lineWidth(this.border.width)
          .moveTo(offsetX, offsetY + cell.height)
          .lineTo(offsetX, offsetY + offsetHeight)
          .strokeColor(this.border.color)
          .stroke()
          .restore();
      }
    });
  }

  /**
   * 绘制页面底部
   * @param {number} pageIndex - 页码
   */
  drawPageFooter(pageIndex) {
    this.image(
      path.resolve(__dirname, "images/logo-icon.png"),
      this.margin.left,
      this.page.height - 40,
      { width: 26, height: 26 }
    );
    this.image(
      path.resolve(__dirname, "images/logo-text.png"),
      this.margin.left + 26,
      this.page.height - 34,
      { width: 49, height: 12 }
    );
    this
      .save()
      .font("Light")
      .fontSize(10)
      .fillColor("#8B8787")
      .text(
        pageIndex,
        this.page.width - 42,
        this.page.height - 40
      )
      .fill()
      .restore();
  }

  /**
   * 绘制页面底部
   */
  drawPageTitle() {
    this
      .save()
      .font("Regular")
      .fontSize(10)
      .fillColor("#3A3A3A")
      .text(
        "词单：",
        this.margin.left,
        this.margin.top - 24
      )
      .fill()
      .restore();
    this
      .save()
      .font("Light")
      .fontSize(10)
      .fillColor("#8B8787")
      .text(
        this.title,
        this.margin.left + 30,
        this.margin.top - 24
      )
      .fill()
      .restore();
  }


  /**
   * 添加表格行
   * @param {number} start - 切割数据数组的下标
   * @param {number} pageIndex - 页码
   */
  addRows(start = 0, pageIndex = 1) {
    const rowData = this.rows.slice(start);

    const headerRow = this.getRowConfig(this.rowConfig).reduce((previous, cell, cellIndex) => {
      previous[cellIndex] = cell.title;
      return previous;
    }, {});
    rowData.unshift(headerRow);

    let offsetHeight = 0;
    const pageRows = [];
    for (let rowIndex = 0; rowIndex < rowData.length; rowIndex++) {
      const item = rowData[rowIndex];

      const row = this.getRowConfig(this.rowConfig, { isHeader: rowIndex === 0 });
      row.forEach((cell, cellIndex) => {
        cell.text = "";
        if (cell.isHeader) {
          item[cellIndex] && (cell.text = item[cellIndex]);
        } else {
          item[cell.key] && (cell.text = item[cell.key]);
          cell.key === "_index_" && (cell.text = (start + rowIndex).toString());
        }

        this.save();
        this.font(cell.font);
        this.fontSize(cell.fontSize);
        cell.textWidth = this.widthOfString(cell.text, this.getCellTextConfig(cell));
        this.restore();
      });

      const cellTextHeights = row.map(cell => {
        this.save();
        this.font(cell.font);
        this.fontSize(cell.fontSize);
        cell.textHeight = this.heightOfString(cell.text, this.getCellTextConfig(cell));
        this.restore();
        return cell.textHeight;
      });
      const cellTextMaxHeight = Math.max(...cellTextHeights);
      row.forEach((cell, cellIndex) =>
        (cell.height = cellTextMaxHeight + cell.padding.top + cell.padding.bottom)
      );

      if (
        this.margin.top + offsetHeight + row[0]["height"] + this.margin.bottom
        > this.page.height
      ) {
        this.drawBorder(pageRows, offsetHeight);
        this.drawPageTitle();
        this.drawPageFooter(pageIndex);
        this.addPage();
        this.addRows(start + rowIndex - 1, pageIndex + 1);
        return;
      }

      pageRows.push(row);

      let offsetWidth = 0;
      for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
        const cell = row[cellIndex];

        offsetWidth += cellIndex === 0 ? 0 : row[cellIndex - 1].width;

        const offsetX = this.margin.left + offsetWidth;
        const offsetY = this.margin.top + offsetHeight;

        this.lineWidth(this.border.width);

        this
          .save()
          .fillColor(this.getCellBackground(cell, rowIndex))
          .strokeOpacity(0)
          .rect(
            offsetX,
            offsetY,
            cell.width,
            cell.height
          )
          .fillAndStroke()
          .restore();

        if (cell.text) {
          this
            .save()
            .font(cell.font)
            .fontSize(cell.fontSize)
            .fillColor(cell.color)
            .text(
              cell.text,
              this.getCellTextPosition(cell, offsetX, offsetY).x,
              this.getCellTextPosition(cell, offsetX, offsetY).y,
              this.getCellTextConfig(cell)
            )
            .fill()
            .restore();
        }

        cellIndex === row.length - 1 && (offsetHeight += cell.height);
      }
    }

    this.drawBorder(pageRows, offsetHeight);
    this.drawPageTitle();
    this.drawPageFooter(pageIndex);
  }
};





