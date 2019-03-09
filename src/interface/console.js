/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const express = require('express');
const notifier = require('node-notifier');
const tpl = require('../template/log');
const portscanner = require('portscanner');

/**
 * Servidor para exibir logs em tempo real
 *
 * @param {int} port
 */
function consoleLogs(port) {
    portscanner.findAPortNotInUse(port, port, '0.0.0.0', function (error, result) {
        if (result == false) {
            console.log('Porta ' + port + ' já está sendo utilizada, escolha outra porta.');
        } else {

            let app = express();

            app.get('/', function (req, res) {
                if (
                    req.query['main'] !== undefined &&
                    req.query['url'] !== undefined &&
                    req.query['date'] !== undefined
                ) {
                    /** @type {log_type} */
                    let log = req.query;
                    let log_msg = tpl.prepareLog(log);

                    // Exibe o Log
                    console.log(log_msg + "\n");

                    let msg = "";
                    if (log.main.type === "throwable") {
                        msg = log.main.title.toString() + "\n" + log.main.trace.toString();
                    } else if (log.main.type === "object" || log.main.type === "text") {
                        msg = log.main.text.toString();
                    }

                    notifier.notify({
                        title: (tpl.TYPE_NAME[log.type] || log.type),
                        message: msg.substring(0, 200)
                    });

                    res.send("1");
                } else {
                    res.send("0");
                }
            });

            app.listen(port, function () {
                console.log('Console de logs executando na porta ' + port + '!');
            });
        }
    });
}

module.exports = consoleLogs;