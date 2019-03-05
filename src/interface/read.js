/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const fs = require('fs-extra');
const path = require('path');
const tpl = require('../template/log');
const chalk = require('chalk');

/**
 * Leitura de logs em arquivo
 *
 * @param {string} path_file
 * @param {boolean} show_size
 */
function readLogs(path_file, show_size) {
    try {
        path_file = path.resolve("./", path_file);
        let filename = path.basename(path_file);

        if (!fs.existsSync(path_file)) throw "Arquivo não existe.";

        // Exibir o tamanho do arquivo
        if (show_size) {
            const stats = fs.statSync(path_file);
            console.log(filename + ": " + (stats.size / 1048576).toFixed(3) + " MB");
            return;
        }

        // Pega os dados do arquivo e verifica se é um array
        let logs = require(path_file);
        if (!Array.isArray(logs)) throw "Não é um log válido.";

        console.log(chalk.bold("== " + filename + " ================================") + "\n");

        // Percorre os dados
        for (const i in logs) {
            try {
                /** @type {log_type} */
                const log = logs[i];

                let log_msg = tpl.prepareLog(log);

                // Exibe o Log
                console.log(log_msg + "\n");
            } catch (e) {
                console.log("Formato incorreto para index do log.\n\n");
            }
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = readLogs;