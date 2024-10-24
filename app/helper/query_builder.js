'use strict';

const { Sequel } = require('../config/connection');
const { isBoolean } = require('./utils');

module.exports = class QueryBuilder {
  constructor(query, data = {}, options = {}) {
    this.data = data;
    this.mainQuery = query;
    this.query = query;
    this.aliasQuery = '';
    this.filterQuery = '';
    this.groupingQuery = '';
    this.tableName = '';
    this.order = '';
    this.limitOffset = '';
    this.safeQuery = [];

    if (data.page && data.limit) {
      var start = 0;
      if (data.page > 1) {
        start = parseInt((data.page - 1) * data.limit);
      }
      var end = parseInt(data.limit);
      this.limitOffset = ` OFFSET ${start} ROWS FETCH NEXT ${end} ROWS ONLY `;
    }

    const splitAliasAndQuery = () => {
      let text = this.query;
      let match = text.match(/with(.*?)\)\s*select/is);
      if (match) {
        this.aliasQuery = ' WITH ' + match[1] + ' ) ';
        this.query = ' SELECT ' + text.match(/WITH.*\)\s*select(.*)/is)[1];
      }
    };
    const getTableName = () => {
      const regex = /FROM\s+(\w+)\s+LEFT JOIN/;
      const match = this.query.match(regex);
      if (match) this.tableName = match[1];
    };
    splitAliasAndQuery();
    getTableName();
    if (this.query.toLowerCase().split('where').length == 1) {
      this.query += ` WHERE 1+1 = 2 `;
    }
  }
  getMainQuery() {
    return this.mainQuery;
  }
  getAllQuery() {
    let buildQuery = `${this.aliasQuery} ${this.query} ${this.groupingQuery} ${this.order} ${this.limitOffset}`;
    return buildQuery;
  }
  log() {
    console.log('====================MAIN QUERY====================');
    console.log(this.getAllQuery());
    console.log('====================COUNT QUERY====================');
    console.log(this.getCountQuery());
  }

  async getData() {
    let _data = await Sequel.query(this.getAllQuery());
    return _data[0];
  }
  async getDataAndCountAll() {
    let _res = { rows: await this.getData(), count: await this.getCount() };
    return _res;
  }
  getCountQuery() {
    let buildQuery = `${this.aliasQuery} SELECT COUNT(*) total FROM (${this.query}  ${this.groupingQuery} ) a`;
    return buildQuery;
  }
  async getCount() {
    let _data = await Sequel.query(this.getCountQuery());
    return _data[0][0].total || 0;
  }
  grouping(group) {
    this.groupingQuery = ` GROUP BY ${group} `;
  }
  ordering(order, type = 'DESC') {
    if (order && type) this.order += ` ORDER BY ${order} ${type} `;
  }

  isInt(value) {
    return (
      !isNaN(value) &&
      parseInt(Number(value)) == value &&
      !isNaN(parseInt(value, 20))
    );
  }

  search(allowSearch = Array) {
    const { search, searchText } = this.data;
    const srch = search || searchText;
    if (!srch || !allowSearch) return '';
    // CONVERT array yang akan digunakan jika bertemu string terlarang seperti transaction maka dirubah menjadi [transaction]
    let output = allowSearch.map((str) => {
      let parts = str.split('.');
      for (let i = 0; i < parts.length; i++) {
        if (this.safeQuery.includes(parts[i])) {
          parts[i] = `[${parts[i]}]`;
          break;
        }
      }
      return parts.join('.');
    });
    allowSearch = output;
    let _query = ' AND (';
    for (const it of allowSearch) {
      _query += ` ${it} ILIKE '%${srch}%' OR`;
    }
    _query = _query.replace(/OR$/, '');
    _query += ' ) ';
    this.query += _query;
  }

  exactSearch(allowSearch = Array) {
    let _data = JSON.parse(JSON.stringify(this.data));
    delete _data.search;
    delete _data.page;
    delete _data.limit;
    _data.status = _data.status || _data.StatusCode;
    let _query = '';
    for (const it of allowSearch) {
      let split = it.split('.');
      if (
        split.length > 1 &&
        (_data[split[1]] || this.isInt(_data[split[1]]))
      ) {
        let col = it.split('.')[1]; // eg: trx_inbound.id menjadi [trx_inbound, id]
        if (Array.isArray(_data[col])) {
          _query += ` AND ${it} IN (${_data[col].map((txt) => `'${txt}'`)}) `;
        } else {
          _data[col] = _data[col].toString();
          if (_data[col].toLowerCase() === 'null') {
            _query += ` AND ${it} IS NULL `;
          } else if (_data[col].toLowerCase() !== 'undefined') {
            _query += ` AND ${it} = '${_data[col]}' `;
          }
        }
      } else if (_data[it] || this.isInt(_data[it])) {
        if (Array.isArray(_data[it])) {
          _query += ` AND ${it} IN (${_data[it].map((txt) => `'${txt}'`)}) `;
        } else {
          _data[it] = _data[it].toString();
          if (_data[it].toLowerCase() === 'null') {
            _query += ` AND ${it} IS NULL `;
          } else {
            _query += ` AND ${it} = '${_data[it]}' `;
          }
        }
      }
    }
    if (this.data.StartDate && this.data.EndDate) {
      let idx = allowSearch.findIndex((o) => o.includes('created_date'));
      if (idx >= 0) {
        _query += ` AND  ( CONVERT(date, ${allowSearch[idx]}) BETWEEN  '${this.data.StartDate}' AND '${this.data.EndDate}' ) `;
      }
    }
    if (this.data.SearchType) {
      let key = this.data.SearchType.toLowerCase();
      let indexSafe = this.safeQuery.indexOf(key);
      let idx = allowSearch.findIndex((o) => o.split('.')[1] == key);
      if (~idx) key = allowSearch[idx];
      if (~indexSafe) key = `${key.split('.')[0]}.[${key.split('.')[1]}]`; //kata transaction akan menjadi [transaction]
      if (this.data.SearchVal1 && this.data.SearchVal2) {
        _query += ` AND ${key} >= '${this.data.SearchVal1}' AND ${key} <= '${this.data.SearchVal2}' `;
      } else if (this.data.SearchVal1) {
        _query += ` AND ${key} = '${this.data.SearchVal1}' `;
      } else {
        if (this.data.SearchType == 'minimum') {
          _query += ` AND ${key} >= product_stock_serial.quantity `;
        } else if (this.data.SearchType == 'maximum') {
          _query += ` AND ${key} <= product_stock_serial.quantity `;
        }
      }
    }
    this.query += _query;
  }

  orExactSearch(allowSearch = Array) {
    let _data = JSON.parse(JSON.stringify(this.data));
    delete _data.search;
    delete _data.page;
    delete _data.limit;
    _data.status = _data.status || _data.StatusCode;
    let _query = '';
    for (const it of allowSearch) {
      let split = it.split('.');
      if (
        split.length > 1 &&
        (_data[split[1]] || this.isInt(_data[split[1]]))
      ) {
        let col = it.split('.')[1]; // eg: trx_inbound.id menjadi [trx_inbound, id]
        if (Array.isArray(_data[col])) {
          _query += ` OR ${it} IN (${_data[col].map((txt) => `'${txt}'`)}) `;
        } else {
          _data[col] = _data[col].toString();
          if (_data[col].toLowerCase() === 'null') {
            _query += ` OR ${it} IS NULL `;
          } else if (_data[col].toLowerCase() !== 'undefined') {
            _query += ` OR ${it} = '${_data[col]}' `;
          }
        }
      } else if (_data[it] || this.isInt(_data[it])) {
        if (Array.isArray(_data[it])) {
          _query += ` OR ${it} IN (${_data[it].map((txt) => `'${txt}'`)}) `;
        } else {
          _data[it] = _data[it].toString();
          if (_data[it].toLowerCase() === 'null') {
            _query += ` OR ${it} IS NULL `;
          } else {
            _query += ` OR ${it} = '${_data[it]}' `;
          }
        }
      }
    }
    if (this.data.StartDate && this.data.EndDate) {
      let idx = allowSearch.findIndex((o) => o.includes('created_date'));
      if (idx >= 0) {
        _query += ` OR  ( CONVERT(date, ${allowSearch[idx]}) BETWEEN  '${this.data.StartDate}' AND '${this.data.EndDate}' ) `;
      }
    }
    if (this.data.SearchType) {
      let key = this.data.SearchType.toLowerCase();
      let indexSafe = this.safeQuery.indexOf(key);
      let idx = allowSearch.findIndex((o) => o.split('.')[1] == key);
      if (~idx) key = allowSearch[idx];
      if (~indexSafe) key = `${key.split('.')[0]}.[${key.split('.')[1]}]`; //kata transaction akan menjadi [transaction]
      if (this.data.SearchVal1 && this.data.SearchVal2) {
        _query += ` OR ${key} >= '${this.data.SearchVal1}' OR ${key} <= '${this.data.SearchVal2}' `;
      } else if (this.data.SearchVal1) {
        _query += ` OR ${key} = '${this.data.SearchVal1}' `;
      } else {
        if (this.data.SearchType == 'minimum') {
          _query += ` OR ${key} >= product_stock_serial.quantity `;
        } else if (this.data.SearchType == 'maximum') {
          _query += ` OR ${key} <= product_stock_serial.quantity `;
        }
      }
    }
    if (_query) {
      _query = ` AND (${_query.replace(/^\s*OR\s*/g, '')})`;
    }
    this.query += _query;
  }
};
