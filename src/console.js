#!/usr/bin/env node

/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const express = require('express');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const argv = require('yargs').argv;
const notifier = require('node-notifier');
const tpl = require('./template');

/**
 * Exibir lista de comandos
 */
function help() {
    console.log(
        chalk.bold('Uso: ') + "blazar-console --port 4000\n\n" +
        chalk.bold('Opções:') + "\n" +
        "   --help, -h      Lista de comandos.\n" +
        "   --port          Define a porta que será utilizada pelo servidor.\n" +
        "                       A porta padrão é a 4000.\n" +
        "   --file          Pegar logs de um arquivos json.\n" +
        "   --file[--size]  Exibir o tamanho do arquivo.");
}

/**
 * Leitura de logs em arquivo
 *
 * @param {string} path_file
 * @param {boolean} show_size
 */
function leitorLogs(path_file, show_size) {
    try {
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

/**
 * Servidor para exibir logs em tempo real
 *
 * @param {int} port
 */
function serverLogs(port) {
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
        console.log('Executando na porta ' + port + '!');
    });
}

if (argv.h || argv.help) {
    // Exibe lista de comandos
    help();
} else if (argv.file) {
    // Leitura de logs em arquivo
    leitorLogs(path.resolve("./", argv.file), argv.size);
} else {
    // Servidor para exibir logs em tempo real
    const PORT = (argv.port && !isNaN(argv.port)) ? parseInt(argv.port) : 4000;
    serverLogs(PORT);
}

/**
 * @typedef {object} log_type
 *
 * @property {string} [type=d] (e|w|i|d)
 * @property {string} url
 * @property {string} date (2019-02-09 18:32:34)
 * @property {object} main
 * @property {string} main.type (text|throwable|object)
 * @property {string} [main.text] (text|object)
 * @property {string} [main.title] (throwable)
 * @property {string} [main.trace] (throwable)
 * @property {object|null} [aux]
 * @property {string} aux.type (text|throwable|object)
 * @property {string} [aux.text] (text|object)
 * @property {string} [aux.title] (throwable)
 * @property {string} [aux.trace] (throwable)
 * @property {string} [trace]
 * @property {string} [tag]
 */
