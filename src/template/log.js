/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const chalk = require('chalk');

const TYPE_NAME = {
    "e": "Error",
    "w": "Warning",
    "i": "Info",
    "d": "Debug"
};

function types(type) {
    let log_name = TYPE_NAME[type] || type;

    switch (type) {
        case "d":
            type = chalk.cyanBright("[" + log_name + "]");
            break;

        case "e":
            type = chalk.red("[" + log_name + "]");
            break;

        case "w":
            type = chalk.magentaBright("[" + log_name + "]");
            break;

        case "i":
            type = chalk.yellowBright("[" + log_name + "]");
            break;

        default:
            type = chalk.gray("[" + log_name + "]");
    }

    return type;
}

/**
 * Monta a estrutura para exibir o log
 * @param {log_type} log_data
 */
function prepareLog(log_data) {
    log_data.type = (log_data.type || "d").toLowerCase();

    // Tipo e Tag
    let log_msg = types(log_data.type) + " " + (log_data.tag != null ? "- " + log_data.tag + " " : "");
    // URL e Data
    log_msg += log_data.url + " " + chalk.gray(log_data.date) + "\n\n";

    // Log principal
    if (log_data.main.type === "throwable") {
        log_msg += chalk.bold("Throw Message: ") + log_data.main.title + "\n" + chalk.red(log_data.main.trace) + "\n\n";
    } else if (log_data.main.type === "object" || log_data.main.type === "text") {
        log_msg += log_data.main.text + "\n\n";
    }

    // Log Auxiliar
    if (log_data.aux) {
        if (log_data.aux.type === "throwable") {
            log_msg += chalk.bold("Throw Message: ") + log_data.aux.title + "\n" + chalk.red(log_data.aux.trace) + "\n\n";
        } else if (log_data.aux.type === "object" || log_data.aux.type === "text") {
            log_msg += log_data.aux.text + "\n\n";
        }
    }

    // Trace
    if (log_data.trace) {
        log_msg += chalk.cyan(log_data.trace) + "\n";
    }

    return log_msg;
}

module.exports = {TYPE_NAME, prepareLog, types};

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