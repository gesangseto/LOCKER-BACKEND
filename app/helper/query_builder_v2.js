'use strict';

const { Sequel } = require('../config/connection');
const { isBoolean, isJsonString } = require('./utils');
const moment = require('moment');

module.exports = class QueryBuilderV2 {
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
      // Untuk POSTGRES
      // this.limitOffset = ` OFFSET ${start} ROWS FETCH NEXT ${end} ROWS ONLY `;
      // Untuk MYSQL
      this.limitOffset = ` LIMIT ${data.limit} OFFSET ${start} `;
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

  findOriginal(options) {
    const { alias = '', allowSearch = [], all = false } = options;
    let original = [];
    if (!allowSearch) return '';

    for (const item of allowSearch) {
      if (typeof item === 'object') {
        if (item.alias == alias) {
          original.push(item.original);
          if (!all) break;
        }
      } else if (item == alias || item.endsWith('.' + alias)) {
        original.push(item);
        if (!all) break;
      }
      if (all) {
        if (typeof item === 'object') original.push(item.original);
        else original.push(item);
      }
    }
    if (all) return original;
    else return original[0];
  }

  ultimateSearch(allowSearch = Array) {
    let search_options = this.data['search_options'];
    let filter = null;
    let _query = '';
    if (isJsonString(search_options)) {
      search_options = JSON.parse(search_options);
      filter = search_options['filters'];
    }

    if (!filter || !allowSearch) return '';
    for (const key in filter) {
      let _key = this.findOriginal({ alias: key, allowSearch: allowSearch });
      let operator = filter[key]['operator'];
      let dataBoolean = false;
      let searchData = [];
      if (filter[key].hasOwnProperty('constraints')) {
        // Ini digunakan untuk default search
        searchData = filter[key]['constraints'];
      } else {
        // Ini digunakan untuk boolean search
        searchData = [filter[key]];
        dataBoolean = true;
      }
      let field_query = '';
      // console.log(key, filter[key], '=============');
      // Gunakan ILIKE Untuk Postgres, LIKE untuk msql
      for (const it of searchData) {
        if (it.value || isBoolean(it.value)) {
          if (field_query) field_query += ` ${operator} `;
          // Dibawah ini adalah pencarian bertipe BOOLEAN
          if (it.matchMode === 'equals' && dataBoolean) {
            field_query += ` ${_key} = ${it.value} `;
          }
          // Dibawah ini adalah pencarian bertipe STRING
          else if (it.matchMode === 'startsWith') {
            field_query += ` ${_key} LIKE '${it.value}%'`;
          } else if (it.matchMode === 'endsWith') {
            field_query += ` ${_key} LIKE '%${it.value}'`;
          } else if (it.matchMode === 'contains') {
            field_query += ` ${_key} LIKE '%${it.value}%'`;
          } else if (it.matchMode === 'notContains') {
            field_query += ` ${_key} NOT LIKE '%${it.value}%'`;
          }
          // Dibawah ini adalah pencarian bertipe INTEGER/FLOAT
          else if (it.matchMode === 'equals') {
            field_query += ` ${_key} = '${it.value}'`;
          } else if (it.matchMode === 'notEquals') {
            field_query += ` ${_key} <> '${it.value}'`;
          }
          // Dibawah ini adalah pencarian bertipe DATE
          else if (it.matchMode === 'dateIs') {
            let date = moment(it.value).format('YYYY-MM-DD');
            field_query += ` CAST(${_key} AS DATE) = '${date}'::DATE`;
          } else if (it.matchMode === 'dateIsNot') {
            let date = moment(it.value).format('YYYY-MM-DD');
            field_query += ` CAST(${_key} AS DATE) <> '${date}'::DATE`;
          } else if (it.matchMode === 'dateBefore') {
            let date = moment(it.value).format('YYYY-MM-DD');
            field_query += ` CAST(${_key} AS DATE) < '${date}'::DATE`;
          } else if (it.matchMode === 'dateAfter') {
            let date = moment(it.value).format('YYYY-MM-DD');
            field_query += ` CAST(${_key} AS DATE) > '${date}'::DATE`;
          }
          // Dibawah ini adalah pencarian bertipe INTEGER
        }
      }
      if (field_query) {
        _query += ` AND (${field_query})`;
      }
    }
    this.query += _query;
    console.log(this.query);
  }

  search(allowSearch = Array) {
    const { search, searchText } = this.data;
    const srch = search || searchText;
    if (!srch || !allowSearch) return '';
    let _keys = this.findOriginal({ all: true, allowSearch: allowSearch });
    let _query = ' AND (';
    let _searchQuery = '';
    for (const it of _keys) {
      // Pencarian bertipe ID (CASE SENSITIVE)
      if (
        it == 'id' ||
        it.endsWith('created_at') ||
        it.endsWith('updated_at') ||
        it.endsWith('.id') ||
        it.endsWith('_id') ||
        it.endsWith('_date')
      ) {
        // _searchQuery += ` ${it}::TEXT LIKE '%${srch}%' OR`;
        _searchQuery += ` ${it} LIKE '%${srch}%' OR`;
      }
      // Pencarian bertipe STRING (CASE NOT SENSITIVE)
      else {
        // _searchQuery += ` ${it} ILIKE '%${srch}%' OR`;
        _searchQuery += ` ${it} LIKE '%${srch}%' OR`;
      }
    }
    if (_searchQuery) {
      _searchQuery = _searchQuery.replace(/OR$/, '');
      _query = ` AND ( ${_searchQuery} )`;
    }
    this.query += _query;
  }

  exactSearch(allowSearch = Array) {
    let _data = JSON.parse(JSON.stringify(this.data));
    delete _data.search;
    delete _data.page;
    delete _data.limit;
    delete _data.search_options;
    _data.status = _data.status || _data.StatusCode;
    let _query = '';

    for (const col in _data) {
      let _key = this.findOriginal({ alias: col, allowSearch: allowSearch });
      if (_key) {
        // Pencarian jika data bertipe array, e.g. status=[1,2,6,10]
        if (Array.isArray(_data[col])) {
          _query += ` AND ${_key} IN (${_data[col].map((txt) => `'${txt}'`)}) `;
        }
        // Pencarian jika data bertipe non array, e.g. status=9&id=10
        else {
          _data[col] = _data[col].toString();
          // Jika data yang dikirim null maka cari kedatabase berdasarkan NULL
          if (_data[col].toLowerCase() === 'null') {
            _query += ` AND ${_key} IS NULL `;
          }
          // Jika data yang dikirim adalah boolean maka cari kedatabase berdasarkan data boolean
          else if (isBoolean(_data[col])) {
            _query += ` AND ${_key} = ${_data[col]} `;
          }
          // Jika data yang dikirim bukan undefined maka cari kedatabase berdasarkan data
          else if (_data[col].toLowerCase() !== 'undefined') {
            _query += ` AND ${_key} = '${_data[col]}' `;
          }
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
