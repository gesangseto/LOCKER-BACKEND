'use strict';
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const {
  queryAccessMenu,
  ConfAccessMenu,
} = require('../../model/Admin/access_menu');
const { queryAdmSection } = require('../../model/Admin/section');
const QueryBuilderV2 = require('../../helper/query_builder_v2');

exports.get = async function (req, res) {
  let body = req.query;
  var data = { rows: [body], count: 0 };
  try {
    let searchingParameter = [
      { alias: 'id', original: 'adm_section.id' },
      { alias: 'name', original: 'adm_section.name' },
      { alias: 'code', original: 'adm_section.code' },
      { alias: 'description', original: 'adm_section.description' },
      { alias: 'status_name', original: 'sys_status_information.name' },
      { alias: 'department_name', original: 'adm_department.name' },
    ];
    let genQuery = new QueryBuilderV2(queryAdmSection(), body);
    genQuery.exactSearch(searchingParameter);
    genQuery.search(searchingParameter);
    genQuery.ultimateSearch(searchingParameter);
    genQuery.ordering('adm_section.id');
    // genQuery
    let getData = await genQuery.getData();
    let newData = [];
    for (const it of getData) {
      if (body.id) {
        let data = await Sequel.query(queryAccessMenu(it.id));
        it.access_menu = data[0];
      }
      it.section_id = it.id;
      it.section_code = it.code;
      it.section_name = it.name;
      newData.push(it);
    }
    data.rows = newData;
    data.count = await genQuery.getCount();
    return response.response(data, res);
  } catch (error) {
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};

exports.update = async function (req, res) {
  var data = { data: req.body };
  var _exec = await Sequel.transaction();
  try {
    let body = req.body;

    if (!body.section_id) throw new Error(`Section id is required!`);
    if (!body.access_menu && !body.items) throw new Error(`Items is required!`);
    body.access_menu = body.access_menu || body.items;
    await ConfAccessMenu.destroy({
      where: { section_id: body.section_id },
      transaction: _exec,
    });
    let menus = [];
    for (const it of body.access_menu) {
      let menu = {
        ...body,
        menu_id: it.id,
        create: it.can_create ? it.create : false,
        read: it.can_read ? it.read : false,
        update: it.can_update ? it.update : false,
        delete: it.can_delete ? it.delete : false,
        print: it.can_print ? it.print : false,
        workflow: it.can_workflow ? it.workflow : false,
      };
      delete menu.id;
      menus.push(menu);
    }
    await ConfAccessMenu.bulkCreate(menus, { transaction: _exec });
    await _exec.commit();
    return response.response(data, res);
  } catch (error) {
    await _exec.rollback();
    data.error = true;
    data.message = `${error}`;
    return response.response(data, res);
  }
};
