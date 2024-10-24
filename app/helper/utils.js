const moment = require('moment');
const crypto = require('crypto');
async function nestedData({ data = [], unique = null }) {
  var reformat_obj = {};
  for (const element of data) {
    if (!reformat_obj[element[unique]]) {
      reformat_obj[element[unique]] = [element];
    } else {
      reformat_obj[element[unique]] =
        reformat_obj[element[unique]].concat(element);
    }
  }
  return reformat_obj;
}

function hasDuplicatesArray(array) {
  array = array.filter((n) => n);
  return new Set(array).size !== array.length;
}

function getFirstWord(string = String) {
  string = string.replace(/['"]+/g, '');
  string = string.split(' ');
  let str = string;
  str = str.filter((n) => n);
  return str[0];
}
function getOnlyParent(array = Array, parentAttr) {
  let _res = [];
  for (const it of array) {
    if (!it[parentAttr]) {
      _res.push(it);
    }
  }
  return _res;
}

function treeify(list, idAttr, parentAttr, childrenAttr) {
  if (!idAttr) idAttr = 'id';
  if (!parentAttr) parentAttr = 'parent';
  if (!childrenAttr) childrenAttr = 'children';

  var treeList = [];
  var lookup = {};
  list.forEach(function (obj) {
    lookup[obj[idAttr]] = obj;
    obj[childrenAttr] = [];
  });
  list.forEach(function (obj) {
    if (obj[parentAttr] != null) {
      if (lookup[obj[parentAttr]] !== undefined) {
        lookup[obj[parentAttr]][childrenAttr].push(obj);
      } else {
        treeList.push(obj);
      }
    } else {
      treeList.push(obj);
    }
  });
  return treeList;
}

const secretKey = 'Initial-G';
// Fungsi untuk mengenkripsi data
const encryptData = (data) => {
  if (!data) return;
  const cipher = crypto.createCipher('aes-256-cbc', secretKey);
  let encryptedData = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
};

// Fungsi untuk mendekripsi data
const decryptData = (encryptedData) => {
  const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return JSON.parse(decryptedData);
};

function encrypt({ string = null }) {
  try {
    const crypto = require('crypto');
    const secret = 'Initial-G';
    const encryptedData = crypto
      .createHash('sha256', secret)
      .update(string)
      .digest('hex');
    return encryptedData;
  } catch (error) {
    return false;
  }
}

async function super_menu() {
  let super_menu = [
    // {
    //   _tag: "CSidebarNavTitle",
    //   _children: ["SYSTEM AREA"],
    // },
    {
      // _tag: "CSidebarNavDropdown",
      name: 'System',
      route: '/system',
      icon: '',
      _children: [
        {
          // _tag: "CSidebarNavItem",
          name: 'Configuration',
          to: '/system/configuration',
          flag_create: 1,
          flag_read: 1,
          flag_update: 1,
          flag_print: 1,
          flag_download: 1,
        },
        {
          // _tag: "CSidebarNavItem",
          name: 'Audit Log',
          to: '/system/audit_log',
          flag_create: 1,
          flag_read: 1,
          flag_update: 1,
          flag_print: 1,
          flag_download: 1,
        },
        {
          // _tag: "CSidebarNavItem",
          name: 'Menu Parent',
          to: '/system/menu_parent',
          flag_create: 1,
          flag_read: 1,
          flag_update: 1,
          flag_print: 1,
          flag_download: 1,
        },
        {
          // _tag: "CSidebarNavItem",
          name: 'Menu Child',
          to: '/system/menu_child',
          flag_create: 1,
          flag_read: 1,
          flag_update: 1,
          flag_print: 1,
          flag_download: 1,
        },
      ],
    },
  ];
  return super_menu;
}

function isInt(value) {
  return (
    !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 20))
  );
}

function isArray(value) {
  if (!value || value === undefined || !Array.isArray(value)) {
    return false;
  } else if (value.length == 0) {
    return false;
  } else {
    return true;
  }
}

function isString(value) {
  if (typeof value === 'string' || value instanceof String) {
    return true;
  } else {
    return false;
  }
}

function generateId() {
  return moment().format('x');
}
function percentToFloat(percent) {
  percent = isInt(percent) ? percent : 100;
  return parseInt(percent) / 100;
}

function sumByKey({ key, sum, sum2, array }) {
  let result = Object.values(
    array.reduce((map, r) => {
      if (!map[r[key]])
        map[r[key]] = { ...r, _id: r[key], qty: 0, qty_stock: 0 };
      map[r[key]][sum] += parseInt(r[sum]);
      map[r[key]][sum2] += parseInt(r[sum2]);
      return map;
    }, {})
  );
  return result;
}

function isDate(date, format = 'YYYY-MM-DD hh:mm:ss') {
  let dt = moment(date).format(format);
  if (dt == 'Invalid date') {
    return false;
  } else {
    return dt;
  }
}

function diffDate(date, date2) {
  let diff = moment(date2)
    .startOf('day')
    .diff(moment(date).startOf('day'), 'days');
  return diff;
}
function numberPercent(num, percent) {
  num = parseFloat(isInt(num) ? num : 0);
  percent = parseFloat(isInt(percent) ? percent : 0);
  let result = num + num * (percent / 100);
  return result;
}
function isJsonString(item) {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;
  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }
  if (typeof item === 'object' && item !== null) {
    return true;
  }
  return false;
}

function haveRole(item) {
  if (
    item.flag_create == 0 &&
    item.flag_delete == 0 &&
    item.flag_download == 0 &&
    item.flag_print == 0 &&
    item.flag_read == 0 &&
    item.flag_update == 0
  ) {
    return false;
  }
  return true;
}
const strToBool = (str = '') => {
  try {
    str = str.toString();
    str = str.toUpperCase();
    if (str === 'TRUE') return true;
    return false;
  } catch (error) {
    return null;
  }
};

const strBetween = (string = String, strStart, strEnd) => {
  string = string.toLowerCase();
  strStart = strStart.toLowerCase();
  strEnd = strEnd.toLowerCase();

  return string.substring(string.indexOf(strStart), string.lastIndexOf(strEnd));
};

const sqlInjectionPrevention = (obj) => {
  let sqlRegex = '/[\t\r\n]|(--[^\r\n]*)|(/*[wW]*?(?=*)*/)/gi';
  if (Object.keys(obj).length > 0) {
    for (const key in obj) {
      if (!isJsonString(obj[key])) {
        if (typeof obj[key] === 'string' || obj[key] instanceof String)
          obj[key] = obj[key].toString().replace("'", '`');
      }
    }
  }
  return obj;
};

function humanizeText(str) {
  var i,
    frags = str.split('_');
  for (i = 0; i < frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
  }
  return frags.join(' ');
}

function removeFirstSpace(str) {
  if (!str) return str;
  return str.replace(/^\s+/g, '');
}

function removeAllSpace(str) {
  if (!str) return str;
  return str.toString().replace(/\s/g, '');
}

const isGs1Number = (input) => {
  if (!input) return false;
  if (input.length != 14 && input.length != 18) {
    return false;
  }
  let number = input.slice(0, -1);
  let gs1Number = `${number}${gs1CheckDigit(number)}`;
  return gs1Number == input;
};

const gs1CheckDigit = (input) => {
  let array = input.split('').reverse();
  let total = 0;
  let i = 1;
  array.forEach((number) => {
    number = parseInt(number);
    if (i % 2 === 0) {
      total = total + number;
    } else {
      total = total + number * 3;
    }
    i++;
  });
  return Math.ceil(total / 10) * 10 - total;
};
function sortByKey(array, key, type = 'ASC') {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    let ret;
    if (type == 'ASC') {
      ret = x < y ? -1 : x > y ? 1 : 0;
    } else {
      ret = x > y ? -1 : x < y ? 1 : 0;
    }
    return ret;
  });
}

const decodeEpc = (string) => {
  var result = {
    epc_type: null,
    epc_id: null,
    epc_hr: null,
    company_prefix: null,
    serial_number: null,
    id1: null,
    id2: null,
    id3: null,
  };
  try {
    var key = 'urn:epc:id:';
    string = string.replace(key, '');
    string = string.split(':');
    var id = string[1].split('.');
    result.company_prefix = id[0];
    result.epc_type = string[0];
    if (result.epc_type === 'sgtin') {
      result.serial_number = id[2];
      result.id3 = id[1].substring(1);
    } else if (result.epc_type === 'sscc') {
      result.serial_number = id[1];
    }
    result.id1 = id[1].substring(0, 1);
    result.id2 = id[0];
    result.epc_id = id[1].substring(0, 1) + id[0] + id[1].substring(1);
    result.epc_id = result.epc_id + gs1CheckDigit(result.epc_id);
    if (result.epc_type === 'sgtin') {
      result.epc_hr = `(01)${result.epc_id}(21)${result.serial_number}`;
    } else if (result.epc_type === 'sscc') {
      result.epc_hr = `(00)${result.epc_id}`;
    }
    return result;
  } catch (error) {
    return result;
  }
};
const makeIdDate = (n = 5) => {
  var date = new Date();
  var item_id = date.valueOf();
  return item_id;
};

const isBoolean = (value = '') => {
  if (
    String(value).toLowerCase() == 'true' ||
    String(value).toLowerCase() == 'false'
  ) {
    return true;
  } else {
    return false;
  }
};
const makeId = (length) => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const randomAlphanumeric = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const randomNumeric = (length) => {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
const incrementAlphaNumeric = (str) => {
  let iter, min, len;
  return [...str]
    .reduceRight(
      (a, c, i) => {
        let code = c.charCodeAt();
        if (code >= 48 && code <= 57) {
          // [0-9]
          min = 48;
          len = 10;
        } else if (code >= 65 && code <= 90) {
          // [A-Z]
          min = 65;
          len = 26;
        }
        iter = code - min + a.sum;
        a.res[i] = String.fromCharCode((iter % len) + min);
        a.sum = Math.floor(iter / len);
        return a;
      },
      { res: [], sum: 1 }
    )
    .res.join('');
};

const incrementNumber = (str) => {
  let increment = Number(str) + 1;
  increment = String(increment).padStart(str.length, '0');
  return `${increment}`;
};

module.exports = {
  diffDate,
  decryptData,
  decodeEpc,
  encrypt,
  encryptData,
  getFirstWord,
  gs1CheckDigit,
  generateId,
  getOnlyParent,
  humanizeText,
  hasDuplicatesArray,
  haveRole,
  isGs1Number,
  isInt,
  isArray,
  isString,
  isDate,
  isJsonString,
  isBoolean,
  incrementAlphaNumeric,
  incrementNumber,
  makeId,
  makeIdDate,
  numberPercent,
  nestedData,
  percentToFloat,
  randomNumeric,
  randomAlphanumeric,
  removeFirstSpace,
  removeAllSpace,
  strToBool,
  sortByKey,
  sumByKey,
  super_menu,
  sqlInjectionPrevention,
  strBetween,
  treeify,
};
