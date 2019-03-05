#!/usr/bin/env node

/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const create = require('./interface/create');
const serverLogs = require('./interface/serve');
const readLogs = require('./interface/read');
const yargs = require('yargs');

const argv = yargs
    .scriptName("blazar-cli")
    .usage('$0 <cmd> [args]')
    .command('create [name]', 'Criar um projeto', (yargs) => {
        return yargs.positional('name', {
            describe: 'Nome ',
            type: 'string',
            demandOption: true
        })
    }, (argv) => {
        create(argv.name);
    })
    .command('serve [port]', 'Inicia um servidor local para receber os logs', (yargs) => {
        return yargs.positional('port', {
            describe: 'Define a porta que será utilizada pelo servidor',
            default: 4000,
            required: true,
            type: 'int'
        })
    }, (argv) => {
        serverLogs(argv.port);
    })
    .command('read [path]', 'Ler logs de um arquivo json', (yargs) => {
        return yargs
            .positional('path', {
                describe: 'Caminho para o arquivo',
                required: true,
                type: 'string'
            })
            .option('size', {
                alias: 's',
                describe: 'Exibir tamanho do arquivo',
                type: "boolean"
            })
            .demandOption(['path'])
    }, (argv) => {
        readLogs(argv.path, argv.size);
    })
    .strict(true)
    .demandCommand(1, 'Você precisa de pelo menos um comando antes de prosseguir')
    .alias("help", "h")
    .argv;
