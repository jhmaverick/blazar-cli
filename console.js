#!/usr/bin/env node

/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const express = require('express'),
    chalk = require('chalk'),
    process = require('process'),
    notifier = require('node-notifier');

let app = express(),
    port = 4000;

process.argv.forEach(function (val, index, array) {
    if (val.startsWith("port=")) port = val.replace("port=", "");
});

function log(msg) {
    process.stdout.write(msg);
}

function types(type) {
    let log_name = "";

    switch (type.toLowerCase()) {
        case "d":
            log_name = "Debug";
            type = chalk.cyanBright("[" + log_name + "]");
            break;

        case "e":
            log_name = "Error";
            type = chalk.red("[" + log_name + "]");
            break;

        case "w":
            log_name = "Warning";
            type = chalk.magentaBright("[" + log_name + "]");
            break;

        case "i":
            log_name = "Info";
            type = chalk.yellowBright("[" + log_name + "]");
            break;

        default:
            log_name = type;
            type = chalk.gray("[" + log_name + "]");
    }

    log(type + " ");

    return log_name;
}

function prepareLog(data) {
    let msg = "";
    if (data['type'] === "throwable") {
        console.log(chalk.bold("Throw Message: ") + data['title']);
        console.log(chalk.red(data['trace']));

        msg = data['title'].toString() + "\n" + data['trace'].toString();
    } else if (data['type'] === "object") {
        console.log(data['text']);

        msg = data['text'].toString();
    } else if (data['type'] === "text") {
        console.log(data['text']);

        msg = data['text'].toString();
    }

    return msg;
}

app.get('/', function (req, res) {
    if (
        req.query['main'] !== undefined &&
        req.query['url'] !== undefined &&
        req.query['date'] !== undefined
    ) {
        let log_name = types(req.query['type'] || "d");
        log(req.query['tag'] != null ? "- " + req.query['tag'] + " " : "");
        console.log(req.query['url'] + " " + chalk.gray(req.query['date']));

        console.log("");

        let msg = prepareLog(req.query['main']);
        if (req.query['aux']) {
            console.log();
            prepareLog(req.query['aux']);
        }

        if (req.query['trace']) {
            console.log();
            console.log(chalk.cyan(req.query['trace']));
        }

        console.log("");

        notifier.notify({
            title: log_name,
            message: msg.substring(0, 200)
            //icon: "icon.ico"
        });

        res.send("1");
    } else {
        res.send("0");
    }
});

app.listen(port, function () {
    console.log('Executando na porta ' + port + '!');
});
