var Excel = require('excel4node');
const fs = require('fs');
const moment = require('moment');
let directory = appRoot + '/temp_file';
const response = require('../config/response');
const { isInt } = require('../helper/utils');
class ExportDataToXLS {
  constructor(props) {
    const { items = [], headerTrx = {}, title = '', res } = props;
    this.headerTrx = headerTrx;
    this.items = items;
    this.title = title;
    this.footer = null;
    this.fileName = `${title} ${moment().format("(YYYYMMDD-HHMM)")}.xlsx`;
    this.res = res;
  }

  generate = async (send_response = true) => {
    var workbook = new Excel.Workbook({
      logLevel: 1,
      // dateFormat: "yyyy-mm-dd hh:mm:ss",
    });
    let _regular = workbook.createStyle({
      font: {
        size: 11,
      },
    });

    let _header = workbook.createStyle({
      font: {
        size: 11,
        bold: true,
      },
      fill: {
        type: 'pattern', // the only one implemented so far.
        patternType: 'solid', // most common.
        fgColor: '#a8a8a8', // you can add two extra characters to serve as alpha, i.e. '2172d7aa'.
        // bgColor: "#a8a8a8", // bgColor only applies on patternTypes other than solid.
      },
      border: {
        // §18.8.4 border (Border)
        left: {
          style: 'thin', //§18.18.3 ST_BorderStyle (Border Line Styles) ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
          color: '#000000', // HTML style hex value
        },
        right: {
          style: 'thin',
          color: '#000000',
        },
        top: {
          style: 'thin',
          color: '#000000',
        },
        bottom: {
          style: 'thin',
          color: '#000000',
        },
      },
    });

    // Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('Sheet 1');
    worksheet.row(1).freeze(); // Freezes the top four rows
    let i = 1;

    const keys = Object.keys(this.headerTrx);
    // const keys = Object.keys(Object.assign({}, ...data));
    for (const key of keys) {
      worksheet.cell(1, i).string(key).style(_header);
      i += 1;
    }
    let row = 2;
    for (const it of this.items) {

      let i = 1;
      for (const key of keys) {
        let isi = it[this.headerTrx[key]];
        // Benerin timestamp (Ilanging timezone, semoga no bug)
        if (isi instanceof Date && !isNaN(isi)) {
          isi = isi.toISOString().slice(0, -1);
          isi = moment(isi).format('YYYY-MM-DD HH:mm');
        }

        if (isi || isInt(isi)) isi = isi.toString();
        else isi = '-';
        worksheet.cell(row, i).string(isi).style(_regular);
        i += 1;
      }
      row += 1;
    }
    await new Promise((resolve, reject) => {
      workbook.write(`${directory}/${this.fileName}`, function (err, stats) {
        return resolve(true);
      });
    });
    if (send_response)
      return response.responseFile({ fileName: this.fileName }, this.res);
    else
      return true
  };

  generateCsv = async () => {
    try {

      await this.generate(false)
      let file = await this.convertXlsxToCsv(directory, this.fileName)
      return response.responseFile({ fileName: file }, this.res);
    } catch (error) {

    }
  };

  removeExtension(filename) {
    return filename.replace(/\.[^/.]+$/, '');
  }
  async convertXlsxToCsv(directory, fileName) {
    const fs = require('fs').promises; // Pastikan ini menggunakan fs.promises
    const XLSX = require('xlsx');
    try {
      let input = `${directory}/${fileName}`;
      fileName = this.removeExtension(fileName);
      let output = `${directory}/${fileName}.csv`;

      const workBook = XLSX.readFile(input); // Membaca file Excel
      const csvData = XLSX.utils.sheet_to_csv(workBook.Sheets[workBook.SheetNames[0]], {
        FS: ';', // Memisahkan dengan titik koma
        forceQuotes: true,
      });

      // Menulis data CSV ke file menggunakan fs.promises.writeFile
      await fs.writeFile(output, csvData);

      await fs.unlink(input); // Menghapus file Excel setelah konversi
      return `${fileName}.csv`; // Mengembalikan nama file CSV
    } catch (error) {
      console.error('Error saat konversi XLSX ke CSV:', error);
      throw error; // Melempar kembali kesalahan untuk ditangani di generateCsv
    }
  };
}

module.exports = {
  ExportDataToXLS,
};
