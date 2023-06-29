const path = require("path");
const PDFKit = require("pdfkit");

module.exports = class TablePDF extends PDFKit {
  constructor(options = {}) {
    super({
      size: "A4",
      margin: 0,
      autoFirstPage: true
    });

    this.rows = options.rows || [];
    this.header = { backgroundColor: "#ff5252", color: "#f8fafc" };
    this.border = { width: 1, color: "#475569" };
    this.margin = { top: 20, left: 20, right: 20, bottom: 20 };
    this.rowConfig = options.rowConfig || [];
    this.cellConfig = {
      padding: { top: 5, left: 5, right: 5, bottom: 5 },
      justify: "start", align: "start",
      color: "#475569", backgroundColor: "#ffffff"
    };
    this.checkbox = { width: 24, height: 24, radius: 2 };

    this.registerFont(
      "AlibabaPuHuiTi",
      path.resolve(
        __dirname,
        "fonts/AlibabaPuHuiTi-2-55-Regular/AlibabaPuHuiTi-2-55-Regular.otf"
      )
    );
    this.font("AlibabaPuHuiTi");

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
    const { padding, justify, align, color, backgroundColor } = this.cellConfig;
    for (let index = 0; index < rowConfig.length; index++) {
      rowConfig[index].isHeader = options.isHeader || false;
      rowConfig[index].padding = padding;
      rowConfig[index].justify = rowConfig[index]["justify"] || justify;
      rowConfig[index].align = rowConfig[index]["align"] || align;
      rowConfig[index].color = options.isHeader ? this.header.color : color;
      rowConfig[index].backgroundColor = options.isHeader ? this.header.backgroundColor : backgroundColor;
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
   * 获取表格checkbox的x,y轴位置
   * @param {Object} cell - 单元格信息
   * @param {number} offsetX - 单元格信息
   * @param {number} offsetY - 单元格信息
   * @return {Object}
   */
  getCheckBoxPosition(cell, offsetX, offsetY ) {
    let x = offsetX + cell.padding.left;
    let y = offsetY + cell.padding.top;
    if (cell.justify === "center") {
      x = offsetX + (cell.width - cell.checkbox.width) / 2;
    }
    if (cell.align === "center") {
      y = offsetY + (cell.height - cell.checkbox.height) / 2;
    }
    return {
      x, y
    };
  }

  /**
   * 添加表格行
   * @param {number} start - 切割数据数组的下标
   */
  addRows(start = 0) {
    const rowData = this.rows.slice(start);

    const headerRow = this.getRowConfig(this.rowConfig).reduce((previous, cell, cellIndex) => {
      previous[cellIndex] = cell.title;
      return previous;
    }, {});
    rowData.unshift(headerRow);

    let offsetHeight = 0;
    for (let rowIndex = 0; rowIndex < rowData.length; rowIndex++) {
      const item = rowData[rowIndex];

      const row = this.getRowConfig(this.rowConfig, { isHeader: rowIndex === 0 });
      row.forEach((cell, cellIndex) => {
        cell.text = "";
        cell.checkbox = null;
        if (cell.isHeader) {
          item[cellIndex] && (cell.text = item[cellIndex]);
        } else {
          item[cell.key] && (cell.text = item[cell.key]);
          cell.key === "_index_" && (cell.text = (start + rowIndex).toString());
          cell.key === "_checkbox_" && (cell.checkbox = this.checkbox);
        }
        cell.textWidth = this.widthOfString(cell.text, this.getCellTextConfig(cell));
      });

      const cellTextHeights = row.map(cell =>
        (cell.textHeight = this.heightOfString(cell.text, this.getCellTextConfig(cell)))
      );
      const cellTextMaxHeight = Math.max(...cellTextHeights);
      const cellCheckboxHeights = row.map(cell => cell.checkbox ? cell.checkbox.height : 0);
      const cellCheckboxMaxHeight = Math.max(...cellCheckboxHeights);
      row.forEach((cell, cellIndex) =>
        (cell.height = Math.max(cellTextMaxHeight, cellCheckboxMaxHeight) + cell.padding.top + cell.padding.bottom)
      );

      let offsetWidth = 0;
      for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
        const cell = row[cellIndex];

        offsetWidth += cellIndex === 0 ? 0 : row[cellIndex - 1].width;

        const offsetX = offsetWidth + this.margin.left;
        const offsetY = offsetHeight + this.margin.top;

        if (
          cellIndex === 0 &&
          (offsetY + cell.height + this.margin.bottom > this.page.height)
        ) {
          this.addPage();
          this.addRows(start + rowIndex - 1);
          return;
        }

        this.lineWidth(this.border.width);
        this.fillColor(cell.backgroundColor);
        this.strokeColor(this.border.color);
        this.rect(
          offsetX,
          offsetY,
          cell.width,
          cell.height
        ).fillAndStroke();
        this.fillColor(cell.color);
        this.text(
          cell.text,
          this.getCellTextPosition(cell, offsetX, offsetY).x,
          this.getCellTextPosition(cell, offsetX, offsetY).y,
          this.getCellTextConfig(cell)
        );
        if (cell.text) {
          this.fillColor(cell.color);
          this.text(
            cell.text,
            this.getCellTextPosition(cell, offsetX, offsetY).x,
            this.getCellTextPosition(cell, offsetX, offsetY).y,
            this.getCellTextConfig(cell)
          ).fill();
        }
        if (cell.checkbox) {
          this.strokeColor(cell.color);
          this.roundedRect(
            this.getCheckBoxPosition(cell, offsetX, offsetY).x,
            this.getCheckBoxPosition(cell, offsetX, offsetY).y,
            cell.checkbox.width,
            cell.checkbox.height,
            cell.checkbox.radius
          ).stroke();
        }

        cellIndex === row.length - 1 && (offsetHeight += cell.height);
      }
    }
  }
};





