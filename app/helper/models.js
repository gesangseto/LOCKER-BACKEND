const Pool = require("pg").Pool;
const moment = require("moment");
const { isInt, getFirstWord, strBetween } = require("./utils");

var db_config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
};

const pool = new Pool(db_config);

var data_set = {
  error: false,
  data: [],
  total: 0,
  grand_total: 0,
  message: "Success",
};

async function get_configuration({ property = null }) {
  let _data = await exec_query("SELECT * FROM sys_configuration LIMIT 1");
  try {
    return _data.data[0];
  } catch (error) {
    return false;
  }
}

async function generate_query_insert({ table, values }) {
  let get_structure = `select column_name, data_type, character_maximum_length, column_default, is_nullable
  from INFORMATION_SCHEMA.COLUMNS where table_name = '${table}';`;
  get_structure = await exec_query(get_structure);
  let column = "";
  let datas = "";
  let query = `INSERT INTO ${table} `;
  if (typeof values === "object" && values !== null) {
    for (const key_v in values) {
      for (const it of get_structure.data) {
        let key = it.column_name;
        if (key_v === key) {
          if (it.data_type.includes("timestamp")) {
            let date = moment(values[key_v]).format("YYYY-MM-DD hh:mm:ss");
            if (date !== "Invalid date") values[key_v] = date;
          }
          if (
            (values[key_v] || values[key_v] == 0) &&
            values[key_v] != "lastval()"
          ) {
            column += ` ${key_v},`;
            datas += ` '${values[key_v]}',`;
          } else if (values[key_v] == "lastval()") {
            column += ` ${key_v},`;
            datas += ` ${values[key_v]},`;
          }
        }
      }
    }
    column = ` (${column.substring(0, column.length - 1)}) `;
    datas = ` (${datas.substring(0, datas.length - 1)}) `;
    query += ` ${column} VALUES ${datas} ;\n`;
  }
  return query;
}

async function generate_query_update({ table, values, key }) {
  let get_structure = `select column_name, data_type, character_maximum_length, column_default, is_nullable
  from INFORMATION_SCHEMA.COLUMNS where table_name = '${table}';`;
  get_structure = await exec_query(get_structure);
  let column = "";
  let query = `UPDATE ${table} SET`;
  if (typeof values === "object" && values !== null) {
    for (const key_v in values) {
      for (const itm of get_structure.data) {
        if (key_v === itm.column_name) {
          if (itm.data_type.includes("timestamp")) {
            let _dt = moment(values[key_v]).format("YYYY-MM-DD hh:mm:ss");
            values[key_v] = _dt != "Invalid date" ? _dt : null;
          }
          if (values[key_v] || values[key_v] == 0) {
            column += ` ${key_v}= '${values[key_v]}',`;
          }
        }
      }
    }
    column = ` ${column.substring(0, column.length - 1)}`;
    query += ` ${column} WHERE ${key} = '${values[key]}';\n `;
  }
  return query;
}

async function exec_query(query_sql) {
  let _data = JSON.parse(JSON.stringify(data_set));
  return await new Promise((resolve) =>
    pool.query(query_sql, function (err, rows) {
      if (err) {
        if (err.code == 42703) {
          _data.data = [];
          _data.total = 0;
          _data.grand_total = 0;
          return resolve(_data);
        }
        _data.error = true;
        _data.message =
          `EXEC_QUERY: ${err.table} -> ${err.message}` ||
          "Oops, something wrong";
        return resolve(_data);
      }
      _data.data = rows.rows;
      _data.total = rows.rowCount;
      _data.grand_total = rows.rowCount;
      return resolve(_data);
    })
  );
}

async function exec_multiple_query(query_sql) {
  let _data = JSON.parse(JSON.stringify(data_set));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(query_sql);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code == 42703) {
      _data.data = [];
      _data.total = 0;
      _data.grand_total = 0;
      return resolve(_data);
    }
    _data.error = true;
    _data.message = `EXEC_QUERY: ${err.message}` || "Oops, something wrong";
    return _data;
  } finally {
    client.release();
    _data.data = rows.rows;
    _data.total = rows.rowCount;
    _data.grand_total = rows.rowCount;
    return _data;
  }
}

async function get_query(query_sql, generate_approval = true) {
  let _data = JSON.parse(JSON.stringify(data_set));
  // Generate COUNT
  var _where = query_sql.split("FROM") || query_sql.split("from");
  _where = _where[1].split("LIMIT") || _where[1].split("limit");
  _where[0] = _where[0].split("ORDER BY")[0] || _where[0].split("order by")[0];
  var count = `SELECT COUNT(1) OVER() AS total FROM ${_where[0]}`;
  count = await exec_query(count);
  if (count.error) {
    _data.error = true;
    _data.message = count.message;
    return _data;
  } else if (count.total === 0) {
    _data.error = false;
    _data.message = count.message;
    return _data;
  }
  count = count.data[0].total ? count.data[0].total : 0;
  let table = getFirstWord(_where[0]);
  let _data_db = await new Promise((resolve) =>
    pool.query(query_sql, function (err, rows) {
      if (err) {
        if (err.code == 42703) {
          _data.data = [];
          _data.total = 0;
          _data.grand_total = 0;
          return resolve(_data);
        }
        _data.error = true;
        _data.message = `GET_QUERY: ${err.message}` || "Oops, something wrong";
        return resolve(_data);
      }
      _data.data = rows.rows;
      _data.total = rows.rowCount;
      _data.grand_total = parseInt(count);
      return resolve(_data);
    })
  );
  if (!generate_approval) {
    return _data;
  }
  _res = [];
  for (const it of _data_db.data) {
    let approval = await getApprovalFlow(table, it[`${table}_id`]);
    it.approval = approval;
    _res.push(it);
  }
  _data.data = _res;
  return _data;
}
async function get_query2(query_sql, generate_approval = true) {
  let _data = JSON.parse(JSON.stringify(data_set));
  // Generate COUNT
  var _where = query_sql.split("FROM") || query_sql.split("from");
  _where = _where[1].split("LIMIT") || _where[1].split("limit");
  _where[0] = _where[0].split("ORDER BY")[0] || _where[0].split("order by")[0];
  var count = `SELECT COUNT(1) OVER() AS total ${strBetween(
    query_sql,
    "FROM",
    "WHERE"
  )}`;
  count = await exec_query(count);
  if (count.error) {
    _data.error = true;
    _data.message = count.message;
    return _data;
  } else if (count.total === 0) {
    _data.error = false;
    _data.message = count.message;
    return _data;
  }
  count = count.data[0].total ? count.data[0].total : 0;
  let table = getFirstWord(_where[0]);
  let _data_db = await new Promise((resolve) =>
    pool.query(query_sql, function (err, rows) {
      if (err) {
        if (err.code == 42703) {
          _data.data = [];
          _data.total = 0;
          _data.grand_total = 0;
          return resolve(_data);
        }
        _data.error = true;
        _data.message = `GET_QUERY: ${err.message}` || "Oops, something wrong";
        return resolve(_data);
      }
      _data.data = rows.rows;
      _data.total = rows.rowCount;
      _data.grand_total = parseInt(count);
      return resolve(_data);
    })
  );
  if (!generate_approval) {
    return _data;
  }
  _res = [];
  for (const it of _data_db.data) {
    let approval = await getApprovalFlow(table, it[`${table}_id`]);
    it.approval = approval;
    _res.push(it);
  }
  _data.data = _res;
  return _data;
}

async function insert_query({ data, table, onlyQuery = false }) {
  let _data = JSON.parse(JSON.stringify(data_set));
  var column = `SELECT column_name,data_type  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`;
  column = await exec_query(column);
  if (column.error) {
    _data.error = true;
    _data.message = column.message || "Oops, something wrong";
    return _data;
  }
  // Prepare approval
  let check_approval = await getApproval(table);
  let sql_approval = "";
  if (check_approval) {
    sql_approval = await generateInsertApproval(check_approval, data);
    data.status = 0;
  }
  // Prepare approval
  column = column.data;
  var dataArr = [];
  var key = [];
  var val = [];
  for (const k in data) {
    var it = data[k];
    var isColumAvalaible = false;
    var is_text = false;
    var is_time = false;
    var is_int = false;
    for (const col_name of column) {
      if (k == col_name.column_name) {
        isColumAvalaible = true;
        if (col_name.data_type.includes("time")) {
          is_time = true;
        } else if (
          col_name.data_type.includes("int") ||
          col_name.data_type.includes("numeric")
        ) {
          is_int = true;
        } else {
          is_text = true;
        }
      }
    }
    if (isColumAvalaible) {
      if (is_text) {
        if (it) {
          key.push(k);
          val.push(it);
        }
      } else if (is_int && isInt(it)) {
        key.push(k);
        val.push(it);
      } else if (
        is_time &&
        it != "created_at" &&
        moment(it, moment.ISO_8601, true).isValid()
      ) {
        key.push(k);
        val.push(it);
      }
    }
  }

  key = key.toString();
  val = "'" + val.join("','") + "'";
  dataArr = dataArr.join(",");
  var query_sql = `INSERT INTO "${table}" (${key}) VALUES (${val}); \n`;
  query_sql += sql_approval;
  if (onlyQuery) {
    return query_sql;
  }
  return await new Promise((resolve) =>
    pool.query(query_sql, function (err, rows) {
      if (err) {
        _data.error = true;
        _data.message =
          `INSERT_QUERY: ${err.message}` || "Oops, something wrong";
        return resolve(_data);
      }
      _data.data = rows;
      _data.grand_total = rows.length;
      return resolve(_data);
    })
  );
}

async function update_query({ data, key, table, onlyQuery = false }) {
  let _data = JSON.parse(JSON.stringify(data_set));
  var column = `SELECT column_name,data_type  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`;
  column = await exec_query(column);
  if (column.error) {
    _data.error = true;
    _data.message = column.message || "Oops, something wrong";
    return _data;
  }
  column = column.data;
  var dataArr = [];
  for (const k in data) {
    var it = data[k];
    var isColumAvalaible = false;
    var is_text = false;
    var is_time = false;
    var is_int = false;
    var is_bool = false;
    for (const col_name of column) {
      if (k == col_name.column_name) {
        isColumAvalaible = true;
        if (col_name.data_type.includes("time")) {
          is_time = true;
        } else if (col_name.data_type.includes("int")) {
          is_int = true;
        } else if (col_name.data_type.includes("bool")) {
          is_bool = true;
        } else {
          is_text = true;
        }
      }
    }
    if (isColumAvalaible) {
      if (is_text) {
        dataArr.push(` ${k} = '${it}'`);
      } else if (is_int && isInt(it)) {
        dataArr.push(` ${k} = ${it}`);
      } else if (is_bool) {
        dataArr.push(` ${k} = ${it}`);
      } else if (
        is_time &&
        it != "created_at" &&
        moment(it, moment.ISO_8601, true).isValid()
      ) {
        it = moment(it).format("YYYY-MM-DD hh:mm:ss");
        dataArr.push(` ${k} = '${it}'`);
      }
    }
  }
  dataArr = dataArr.join(",");
  var query_sql = `UPDATE "${table}" SET ${dataArr} WHERE ${key}='${data[key]}' ;`;
  let _onApproval = await isOnApproval(table, data[key]);
  if (_onApproval) {
    if (!_onApproval.is_approve) {
      let status = _onApproval.is_approve;
      _data.error = true;
      _data.message = `Cannot edit data, Approval status is ${status == false ? "Rejected" : "Pending"
        }`;
      return _data;
    }
  }
  if (onlyQuery) {
    return query_sql;
  }
  return await new Promise((resolve) =>
    pool.query(query_sql, function (err, rows) {
      if (err) {
        _data.error = true;
        _data.message = err.message || "Oops, something wrong";
        return resolve(_data);
      }
      _data.data = rows;
      _data.grand_total = rows.length;
      return resolve(_data);
    })
  );
}

async function delete_query({
  data,
  key,
  table,
  deleted = false,
  force_delete = false,
  onlyQuery = false,
}) {
  let _data = JSON.parse(JSON.stringify(data_set));

  if (!force_delete) {
    var current_data = `SELECT * FROM "${table}" WHERE ${key}='${data[key]}' LIMIT 1`;
    current_data = await exec_query(current_data);
    if (current_data.error || current_data.total == 0) {
      _data.error = true;
      _data.message = current_data.message || "Oops, something wrong";
      return _data;
    }
    if (current_data.data[0].status == 1) {
      _data.error = true;
      _data.message = "Cannot delete data, must set data to Inactive";
      return _data;
    }
  }
  let query_sql = ``;
  if (deleted) {
    query_sql = `DELETE FROM "${table}" WHERE ${key}='${data[key]}'`;
  } else {
    query_sql = `UPDATE "${table}" SET flag_delete='1' WHERE ${key}='${data[key]}'`;
  }
  if (onlyQuery) {
    return query_sql;
  }
  return await new Promise((resolve) =>
    pool.query(query_sql, function (err, rows) {
      if (err) {
        _data.error = true;
        _data.message = err.message || "Oops, something wrong";
        if (err.code == 23503) {
          _data.message = err.detail;
        }
        return resolve(_data);
      }
      _data.data = rows;
      _data.grand_total = rows.length;
      return resolve(_data);
    })
  );
}

async function filter_query(query, request = Object, allow = Array) {
  let $query = query;
  try {
    for (const k in request) {
      if (k != "page" && k != "limit") {
        $query += ` AND a.${k}='${request[k]}'`;
      }
    }
    if (request.page || request.limit) {
      var start = 0;
      if (request.page > 1) {
        start = parseInt((request.page - 1) * request.limit);
      }
      var end = parseInt(start) + parseInt(request.limit);
      $query += ` LIMIT ${end}  OFFSET ${start} ;`;
    }
    return $query;
  } catch (error) {
    return $query;
  }
}

async function checkIsTableExist(tableName) {
  let query = `SELECT table_name
  FROM information_schema.tables
  WHERE table_schema='public'
  AND table_type='BASE TABLE'
  AND table_name='${tableName}' LIMIT 1;`;
  query = await exec_query(query);
  if (!query.error && query.total == 1) {
    return "EXIST";
  }
  return false;
}

async function isOnApproval(ref_table, ref_id) {
  let query = `SELECT * FROM approval_flow WHERE 1+1=2`;
  if (ref_table && ref_id) {
    query += ` AND approval_ref_table = '${ref_table}'  AND approval_ref_id = '${ref_id}'`;
  } else {
    return false;
  }
  query = await exec_query(query);
  if (query.error || query.data.length == 0) {
    return false;
  }
  return query.data[0];
}

async function getApproval(ref_table) {
  let query = `SELECT * FROM approval WHERE approval_ref_table = '${ref_table}' AND status='1' LIMIT 1`;
  query = await exec_query(query);
  if (query.error || query.data.length == 0) {
    return null;
  } else {
    return query.data[0];
  }
}

async function getApprovalFlow(ref_table, ref_id) {
  let query = `SELECT a.*, b.user_name as approval_user_name, b.user_email as approval_user_email
  FROM approval_flow a
  LEFT JOIN "user" b ON a.approval_current_user_id = b.user_id
  WHERE approval_ref_table = '${ref_table}' AND  approval_ref_id = '${ref_id}' 
  --AND is_approve IS NULL
  LIMIT 1;`;
  query = await exec_query(query);
  if (query.error || query.data.length == 0) {
    return null;
  } else {
    return query.data[0];
  }
}

async function generateInsertApproval(obj = Object, data) {
  delete obj.created_at;
  delete obj.updated_at;
  delete obj.updated_by;
  obj.approval_current_user_id = obj.approval_user_id_1;
  obj.approval_ref_id = "lastval()";
  if (data && data.hasOwnProperty(`${obj.approval_ref_table}_id`)) {
    obj.approval_ref_id = data[`${obj.approval_ref_table}_id`];
  }
  return await generate_query_insert({
    table: "approval_flow",
    values: obj,
  });
}

async function getDefaultId(relation_code) {
  let getData = `SELECT * FROM sys_relation WHERE sys_relation_code='${relation_code}' LIMIT 1`;
  getData = await exec_query(getData);
  if (getData.data.length == 1) {
    return getData.data[0].sys_relation_ref_id;
  }
  return null;
}

function getLimitOffset(page, limit) {
  let _sql = "";
  var start = 0;
  if (page > 1) {
    start = parseInt((page - 1) * limit);
  }
  var end = parseInt(start) + parseInt(limit);
  _sql += ` LIMIT ${end}  OFFSET ${start} ;`;
  return _sql;
}
module.exports = {
  getLimitOffset,
  get_configuration,
  exec_query,
  get_query,
  get_query2,
  insert_query,
  update_query,
  delete_query,
  generate_query_update,
  generate_query_insert,
  filter_query,
  checkIsTableExist,
  exec_multiple_query,
  getDefaultId,
};
