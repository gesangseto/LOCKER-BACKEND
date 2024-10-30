'use strict';
const { Sequelize, Op } = require('sequelize');
const { Sequel } = require('../../config/connection');
const response = require('../../config/response');
const QueryBuilderV2 = require('../../helper/query_builder_v2');
const { humanizeText, treeify } = require('../../helper/utils');
const { LkrBox, queryLkrBox, queryGroupLkrBox } = require('../../model/Locker/locker_box');
const { queryLkrSize, LkrSize, } = require('../../model/Locker/locker_size');

exports.get = async function (req, res) {
    let body = req.query;
    var data = { rows: [body], count: 0 };
    try {

        let searchingParameter = [
            { alias: 'id', original: 'locker_box.id' },
            { alias: 'module', original: 'locker_box.module' },
            { alias: 'number', original: 'locker_box.number' },
            { alias: 'size', original: 'locker_box.size' },
            { alias: 'cabinet', original: 'locker_box.cabinet' },
            { alias: 'status', original: 'locker_box.status' },
        ];
        let genQuery = new QueryBuilderV2(queryGroupLkrBox(), body);
        genQuery.exactSearch(searchingParameter);
        genQuery.search(searchingParameter);
        genQuery.ultimateSearch(searchingParameter);
        genQuery.grouping('locker_box.module');
        let getData = await genQuery.getDataAndCountAll();
        data.rows = getData.rows;
        data.count = getData.count;
        return response.response(data, res);
    } catch (error) {
        data.error = true;
        data.message = `${error}`;
        return response.response(data, res);
    }
};

exports.insert = async function (req, res) {
    var data = { rows: [req.body] };
    var _exec = await Sequel.transaction();
    try {
        let body = req.body;
        let require = ['module', 'cabinet', 'size']
        for (const row of require) {
            if (!body[`${row}`]) {
                throw new Error(`${humanizeText(row)} is required.`);
            }
        }
        let thisBox = await LkrBox.findOne({ where: { module: body.module } })
        if (thisBox) {
            throw new Error(`Duplicate module.`);
        }

        let findMaxBox = `SELECT MAX(module) module, MAX(number) number FROM locker_box;`
        let thisMaxBox = await Sequel.query(findMaxBox, { transaction: _exec })
        thisMaxBox = thisMaxBox[0][0]

        let number = thisMaxBox.number || 0
        let module = thisMaxBox.module || 0
        let findSize = await LkrSize.findOne({ where: { size: body.size } })
        if (!findSize)
            throw new Error(`Size not found.`);

        let batchBox = []
        for (let i = 1; i <= parseInt(body.cabinet); i++) {
            let param = {
                module: module + 1,
                number: number += 1,
                size: body.size,
                cabinet: i,
                status: 'enable'
            }
            batchBox.push(param)
        }

        let _res = await LkrBox.bulkCreate(batchBox, { transaction: _exec });
        await _exec.commit();
        return response.response(_res, res);
    } catch (error) {
        await _exec.rollback();
        data.error = true;
        data.message = `${error}`;
        return response.response(data, res);
    }
};

exports.update = async function (req, res) {
    var data = { rows: [req.body] };
    var _exec = await Sequel.transaction();
    try {
        let body = req.body;
        let require = ['module', 'cabinet', 'size']
        for (const row of require) {
            if (!body[`${row}`]) {
                throw new Error(`${humanizeText(row)} is required.`);
            }
        }
        let thisBox = await LkrBox.findOne({
            where: { module: body.module },
            order: [[Sequelize.col('cabinet'), 'DESC']],
            raw: true
        })
        if (!thisBox) throw new Error(`Module not found.`);

        await LkrBox.destroy({ where: { module: body.module }, transaction: _exec })
        let findSize = await LkrSize.findOne({ where: { size: body.size } })
        if (!findSize)
            throw new Error(`Size not found.`);

        let number = parseInt(thisBox.number) - thisBox.cabinet || 0
        let batchBox = []
        for (let i = 1; i <= parseInt(body.cabinet); i++) {
            let param = {
                module: body.module,
                number: number += 1,
                size: body.size,
                cabinet: i,
                status: 'enable'
            }
            batchBox.push(param)
        }
        await LkrBox.bulkCreate(batchBox, { transaction: _exec });

        //  Update semua number pada module diatasnya
        let findAllBox = await LkrBox.findAll({ where: { number: { [Op.gt]: thisBox.number } }, transaction: _exec })
        for (const box of findAllBox) {
            box.number = number += 1
            await box.save({ transaction: _exec })
        }

        _exec.commit();
        return response.response(data, res);
    } catch (error) {
        _exec.rollback();
        data.error = true;
        data.message = `${error}`;
        return response.response(data, res);
    }
};

exports.delete = async function (req, res) {
    var data = { data: req.body };
    var _exec = await Sequel.transaction();
    try {
        let _res = await LkrBox.destroy({ where: { id: { [Op.ne]: null } }, transaction: _exec, });
        await _exec.commit();
        return response.response(_res, res);
    } catch (error) {
        await _exec.rollback();
        data.error = true;
        data.message = `${error}`;
        return response.response(data, res);
    }
};


exports.getNumber = async function (req, res) {
    let body = req.query;
    var data = { rows: [body], count: 0 };
    try {

        let searchingParameter = [
            { alias: 'id', original: 'locker_box.id' },
            { alias: 'module', original: 'locker_box.module' },
            { alias: 'number', original: 'locker_box.number' },
            { alias: 'size', original: 'locker_box.size' },
            { alias: 'cabinet', original: 'locker_box.cabinet' },
            { alias: 'status', original: 'locker_box.status' },
        ];
        let genQuery = new QueryBuilderV2(queryLkrBox(), body);
        genQuery.exactSearch(searchingParameter);
        genQuery.search(searchingParameter);
        genQuery.ultimateSearch(searchingParameter);
        genQuery.ordering('locker_box.number', 'ASC');
        let getData = await genQuery.getDataAndCountAll();
        data.rows = getData.rows;
        data.count = getData.count;
        return response.response(data, res);
    } catch (error) {
        data.error = true;
        data.message = `${error}`;
        return response.response(data, res);
    }
};
exports.updateNumber = async function (req, res) {
    var data = { rows: [req.body] };
    var _exec = await Sequel.transaction();
    try {
        let body = req.body;
        if (!body.id) {
            throw new Error(`ID is required.`);
        } else if (!body.status) {
            throw new Error(`Status is required.`);
        }
        let thisBox = await LkrBox.findOne({ where: { id: body.id }, transaction: _exec })
        if (!thisBox) throw new Error(`Box not found.`);
        thisBox.status = body.status
        await thisBox.save({ transaction: _exec })
        _exec.commit();
        return response.response(data, res);
    } catch (error) {
        _exec.rollback();
        data.error = true;
        data.message = `${error}`;
        return response.response(data, res);
    }
};