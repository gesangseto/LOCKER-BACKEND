const { incrementNumber, randomAlphanumeric } = require("./utils");
const {
  WhStockSerial,
} = require("../model/Warehouse/Transaction/stock_serial");
const { randomNumeric } = require("./utils");
const { incrementAlphaNumeric } = require("./utils");

class makeSerialNumber {
  constructor({ pid, product }) {
    this.pid = pid;
    this.product = product;
    this.result = {
      serial_number: null,
      epc_id: null,
      epc_key: null,
      epc_hr: null,
      company_prefix: null,
      max_quantity: null,
      max_quantity_child: null,
    };
    if (pid) this.setPid(pid);
    if (product) this.setProduct(product);
  }

  setPid(pid) {
    this.pid = pid;
  }
  setProduct(product) {
    this.product = product;
  }
  async generateSerial({ current_serial, checking }) {
    let serial = current_serial;
    let len = this.pid.sn_generated_len;
    let sn_prefix = this.pid.sn_prefix;
    let charset = this.pid.sn_charset;
    let type = this.pid.sn_generate_type;
    let generated = null;
    let lenSerial = (sn_prefix ? sn_prefix.length : 0) + len;
    if (!serial || serial.length != lenSerial) {
      if (checking) {
        serial = await WhStockSerial.max("serial_number", {
          where: { gtin: this.product.gtin },
        });
      }
      if (!serial) {
        serial = `${sn_prefix ? sn_prefix : ""}${"0".repeat(len)}`;
      }
    }
    generated = serial.substring(sn_prefix ? sn_prefix.length : 0);
    if (charset == "numeric" && type == "sequential") {
      generated = incrementNumber(generated);
      serial = `${sn_prefix ? sn_prefix : ""}${generated}`;
    } else if (charset == "numeric" && type == "random") {
      generated = randomNumeric(len);
      serial = `${sn_prefix ? sn_prefix : ""}${generated}`;
    } else if (charset == "alphanumeric" && type == "sequential") {
      generated = incrementAlphaNumeric(generated);
      serial = `${sn_prefix ? sn_prefix : ""}${generated}`;
    } else if (charset == "alphanumeric" && type == "random") {
      generated = randomAlphanumeric(len);
      serial = `${sn_prefix ? sn_prefix : ""}${generated}`;
    }
    if (checking) {
      let find = await WhStockSerial.findOne({
        where: { serial_number: serial, gtin: this.product.gtin },
      });
      if (find) {
        serial = await this.generateSerial({
          current_serial: serial,
          checking: true,
        });
      }
    }
    return serial;
  }
}

module.exports = {
  makeSerialNumber,
};
