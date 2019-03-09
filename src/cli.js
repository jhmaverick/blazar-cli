#!/usr/bin/env node

/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const create = require('./interface/create');
const consoleLogs = require('./interface/console');
const serve = require('./interface/serverPHP');
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
    .command('serve [path] [port] [port_logs]', 'Inicia um servidor PHP', (yargs) => {
        return yargs.positional('path', {
            describe: 'Caminho para iniciar',
            required: true,
            type: 'string'
        }).positional('port', {
            describe: 'Define a porta que será utilizada pelo servidor',
            default: 8000,
            required: true,
            type: 'int'
        }).positional('port_logs', {
            describe: 'Define a porta que será utilizada para receber os logs',
            default: 4000,
            required: true,
            type: 'int'
        })
    }, (argv) => {
        serve(argv.port, argv.port_logs, argv.path);
    })
    .command('console [port]', 'Inicia um servidor local para receber logs', (yargs) => {
        return yargs.positional('port', {
            describe: 'Define a porta que será utilizada para receber os logs',
            default: 4000,
            required: true,
            type: 'int'
        })
    }, (argv) => {
        consoleLogs(argv.port);
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
