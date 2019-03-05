/*
 * This file is part of Blazar Framework.
 *
 * (c) João Henrique <joao_henriquee@outlook.com>
 *
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const fs = require('fs-extra');
const path = require('path');
const http = require('https');
const process = require('process');
const unzipper = require('unzipper');
const editJsonFile = require("edit-json-file");
const c = require("child_process");

const URL_REPOSITORY = "https://codeload.github.com/jhmaverick/blazar-project/zip/master";
const GIT_MAIN_DIR = "blazar-project-master";
const ZIP_DEST = path.resolve("./", ".blazar-project.zip");

let project_name;
let project_dir;

/**
 * Baixa arquivos do projeto limpo do github
 *
 * @param cb
 */
function download(cb) {
    const zip_file = fs.createWriteStream(ZIP_DEST);

    let len, total, cur = 0;

    const req = http.get(URL_REPOSITORY, function (res) {
        res.pipe(zip_file);

        res.on("data", function (chunk) {
            cur += chunk.length;

            // Limpa a ultima linha do console
            process.stdout.write((process.platform === "win32") ? "\033[0G" : "\r");

            process.stdout.write(
                "Downloading " +
                (!isNaN(len) ? (100.0 * cur / len).toFixed(2) + "% " : "") +
                (cur / 1048576).toFixed(3) + " MB"
            );
        });

        zip_file.on('finish', function () {
            try {
                zip_file.close(cb);

                console.log("\n\nDownload concluído");
            } catch (e) {
                console.log("Error: " + e.message);
                fs.unlink(ZIP_DEST);
                cb(false);
            }
        });
    });

    req.on('response', function (data) {
        len = data.headers['content-length'];

        console.log("Iniciando download dos arquivos...");
        if (!isNaN(len)) {
            len = parseInt(len, 10);
            total = len / 1048576;

            console.log("Total: " + total.toFixed(3) + " MB");
        }

        console.log("");
    });

    req.on("error", function (e) {
        console.log("Error: " + e.message);
        fs.unlink(ZIP_DEST);
        cb(false);
    });
}

/**
 * Extrai os arquivos do projeto
 *
 * @param cb
 */
function unzip(cb) {
    fs.createReadStream(ZIP_DEST)
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
            let fileName = entry.path;
            let type = entry.type; // 'Directory' or 'File'
            //let size = entry.size;

            let local_name = fileName.replace(GIT_MAIN_DIR, project_dir);

            if (type === "Directory") {
                fs.mkdirSync(local_name);
            } else {
                entry.pipe(fs.createWriteStream(local_name));
            }
            // entry.autodrain();
        })
        .promise()
        .then(() => cb(true), () => cb(false));
}

/**
 * Aplica informações nos arquivos
 */
function editData() {
    const manifest_path = path.resolve(project_dir, 'src/blazar-manifest.json');

    if (fs.existsSync(manifest_path)) {
        let manifest = editJsonFile(manifest_path);

        manifest.set("data.name", project_name);
        manifest.set("data.version", "1.0");

        manifest.save();
    }
}

/**
 * Criar um novo projeto
 *
 * @param name Nome do projeto
 */
function createProject(name) {
    project_name = name;
    project_dir = path.resolve("./" + project_name);

    if (!/^[a-zA-Z0-9-._~]*$/g.test(name)) {
        console.log('Nome inválido para o projeto, os caracteres aceitos são: a-Z, 0-9, ".", "-", "_" e "~"');
        return;
    }

    if (fs.existsSync(project_dir)) {
        console.log("Já existe um projeto com este nome");
        return;
    }

    download(() => {
        unzip(() => {
            fs.unlink(ZIP_DEST);
            editData();

            console.log("Instalando dependencias do composer...");
            c.execSync('cd "' + project_dir + '" && composer install', {stdio: 'inherit'});
        });
    });
}

module.exports = createProject;