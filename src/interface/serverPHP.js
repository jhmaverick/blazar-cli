/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const fs = require('fs-extra');
const path = require("path");
const c = require("child_process");
const consoleLogs = require('./console');
const portscanner = require('portscanner');

function checkPort(port, cb) {
    portscanner.findAPortNotInUse(port, port, '0.0.0.0', function (error, result) {
        if (result == false) {
            console.log('Porta ' + port + ' já está sendo utilizada, escolha outra porta.');
        } else {
            cb();
        }
    });
}

/**
 * Servidor para exibir logs em tempo real
 *
 * @param {int} port Porta para o PHP
 * @param {int} console_port Porta para o console de logs
 * @param {string} file_path
 */
function server(port, console_port, file_path) {
    file_path = path.resolve(file_path || "./");

    if (!fs.existsSync(file_path)) {
        console.log("Caminho \"" + file_path + "\" não existe");
        return;
    }

    if (port == console_port) {
        console.log('A porta do servidor não pode ser igual a do console.');
        return;
    }

    checkPort(port, function () {
        checkPort(console_port, function () {
            let console_dir = file_path;

            // Verifica se o local é a raiz do projeto e se existe o public_html
            if (fs.existsSync(path.resolve(file_path, "public_html")) && fs.existsSync(path.resolve(file_path, "vendor"))) {
                console_dir = path.resolve(file_path, "public_html");
            }

            let is_dir = (file_path.substr(-4) !== ".php") ? "-t" : "";

            console.log('http://localhost:' + port + ' rodando em ' + console_dir);
            c.exec('php -S 0.0.0.0:' + port + ' ' + is_dir + ' ' + console_dir, {stdio: 'inherit'});

            console.log("");

            consoleLogs(console_port);
        });
    });
}

module.exports = server;