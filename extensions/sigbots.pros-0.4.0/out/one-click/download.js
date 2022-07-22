"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chmod = exports.downloadextract = exports.extract = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
var fetch = require("node-fetch");
var unzipper = require("unzipper");
var bunzip = require("seek-bzip");
var tar = require("tar-fs");
const fs = require("fs");
const stream = require("stream");
const path = require("path");
const util_1 = require("util");
function download(globalPath, downloadURL, storagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if file type is .tar.bz or .zip
        const bz2 = downloadURL.includes(".bz2");
        yield vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Downloading: " +
                (storagePath.includes("cli") ? "PROS CLI" : "PROS Toolchain"),
            cancellable: true,
        }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            var out;
            token.onCancellationRequested(() => {
                console.log("User canceled the long running operation");
                out.destroy();
            });
            // Fetch the file to download
            const response = yield fetch(downloadURL);
            progress.report({ increment: 0 });
            if (!response.ok) {
                throw new Error(`Failed to download $url`);
            }
            const total_size = Number(response.headers.get("content-length"));
            response.body.on("data", (chunk) => {
                progress.report({ increment: chunk.length * 100 / total_size });
            });
            console.log("Write stream created");
            // Write file contents to "sigbots.pros/download/filename.tar.bz2"
            out = fs.createWriteStream(path.join(globalPath, "download", storagePath));
            console.log("Start stream pipeline");
            yield util_1.promisify(stream.pipeline)(response.body, out).catch((e) => {
                // Clean up the partial file if the download failed.
                fs.unlink(path.join(globalPath, "download", storagePath), (_) => null); // Don't wait, and ignore error.
                console.log(e);
                throw e;
            });
            console.log("Finished downloading");
        }));
        console.log("returning bz2 status");
        return bz2;
    });
}
function extract(globalPath, storagePath, bz2) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Installing: " +
                (storagePath.includes("cli") ? "PROS CLI" : "PROS Toolchain"),
            cancellable: true,
        }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            var e_1, _a, e_2, _b, e_3, _c;
            var read;
            var extract;
            token.onCancellationRequested((token) => {
                console.log("User canceled the long running operation");
                read.destroy();
                extract.destroy();
            });
            if (bz2) {
                // Read the contents of the bz2 file
                console.log("Extracting bz2 file");
                var compressedData = yield fs.promises.readFile(path.join(globalPath, "download", storagePath));
                console.log("Decoding bz2");
                // Decrypt the bz2 file contents.
                let decompressedData;
                try {
                    decompressedData = bunzip.decode(compressedData);
                }
                catch (e) {
                    console.log(e);
                    vscode.window.showErrorMessage("An error occured while decoding the toolchain");
                    console.log("Decoding failed");
                }
                console.log("Bz2 decoded");
                storagePath = storagePath.replace(".bz2", "");
                yield fs.promises.writeFile(path.join(globalPath, "download", storagePath), decompressedData);
                console.log("Completed extraction of bz2 file");
                // Write contents of the decrypted bz2 into "sigbots.pros/download/filename.tar"
                console.log("Extracting tar file");
                yield new Promise(function (resolve, reject) {
                    // Create our read stream
                    read = fs.createReadStream(path.join(globalPath, "download", storagePath));
                    // Remove tar from the filename
                    storagePath = storagePath.replace(".tar", "");
                    // create our write stream
                    extract = tar.extract(path.join(globalPath, "install", storagePath));
                    // Pipe the read stream into the write stream
                    read.pipe(extract);
                    // When the write stream ends, resolve the promise
                    extract.on("finish", resolve);
                    // If there's an error, reject the promise and clean up
                    read.on("error", () => {
                        fs.unlink(path.join(globalPath, "install", storagePath), (_) => null);
                        reject();
                    });
                });
                const files = yield fs.promises.readdir(path.join(globalPath, "install"));
                for (const file of files) {
                    if (file.includes("toolchain")) {
                        const interfiles = yield fs.promises.readdir(path.join(globalPath, "install", file));
                        for (const intfile of interfiles) {
                            if (intfile.includes("gcc-arm-none-eabi")) {
                                const to_bring_out = yield fs.promises.readdir(path.join(globalPath, "install", file, intfile));
                                for (const f of to_bring_out) {
                                    yield fs.promises.rename(path.join(globalPath, "install", file, intfile, f), path.join(globalPath, "install", file, f));
                                }
                            }
                        }
                        console.log(path.join(globalPath, "install", storagePath));
                    }
                }
            } // if bz2
            else {
                console.log("start extraction");
                let readPath = path.join(globalPath, "download", storagePath);
                storagePath = storagePath.replace(".zip", "");
                let writePath = path.join(globalPath, "install", storagePath);
                // Extract the contents of the zip file
                yield fs.createReadStream(readPath).pipe(unzipper.Extract({ path: writePath })).promise();
                console.log("Start file moving");
                if (storagePath.includes("pros-toolchain-windows")) {
                    // create tmp folder
                    console.log("Create tmp folder");
                    yield fs.promises.mkdir(path.join(globalPath, "install", "pros-toolchain-windows", "tmp"));
                    // extract contents of gcc-arm-none-eabi-version folder
                    console.log("began reading usr");
                    const files = yield fs.promises.readdir(path.join(globalPath, "install", "pros-toolchain-windows", "usr"));
                    try {
                        for (var files_1 = __asyncValues(files), files_1_1; files_1_1 = yield files_1.next(), !files_1_1.done;) {
                            const dir = files_1_1.value;
                            if (dir.includes("gcc-arm-none")) {
                                // iterate through each folder in gcc-arm-none-eabi-version
                                const folders = yield fs.promises.readdir(path.join(globalPath, "install", "pros-toolchain-windows", "usr", dir));
                                try {
                                    for (var folders_1 = (e_2 = void 0, __asyncValues(folders)), folders_1_1; folders_1_1 = yield folders_1.next(), !folders_1_1.done;) {
                                        const folder = folders_1_1.value;
                                        if (!folder.includes("arm-none")) {
                                            const subfiles = yield fs.promises.readdir(path.join(globalPath, "install", "pros-toolchain-windows", "usr", dir, folder));
                                            try {
                                                // extract everything back 1 level into their respective folder
                                                for (var subfiles_1 = (e_3 = void 0, __asyncValues(subfiles)), subfiles_1_1; subfiles_1_1 = yield subfiles_1.next(), !subfiles_1_1.done;) {
                                                    const subfile = subfiles_1_1.value;
                                                    // The original file path
                                                    var originalPath = path.join(globalPath, "install", "pros-toolchain-windows", "usr", dir, folder, subfile);
                                                    // Path to move the file to
                                                    var newPath = path.join(globalPath, "install", "pros-toolchain-windows", "usr", folder, subfile);
                                                    // Move the file
                                                    yield fs.promises.rename(originalPath, newPath);
                                                }
                                            }
                                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                            finally {
                                                try {
                                                    if (subfiles_1_1 && !subfiles_1_1.done && (_c = subfiles_1.return)) yield _c.call(subfiles_1);
                                                }
                                                finally { if (e_3) throw e_3.error; }
                                            }
                                        }
                                        else {
                                            // move arm-none folder contents into a new directory under usr
                                            var originalPath = path.join(globalPath, "install", "pros-toolchain-windows", "usr", dir, folder);
                                            var newPath = path.join(globalPath, "install", "pros-toolchain-windows", "usr", folder);
                                            yield fs.promises.rename(originalPath, newPath);
                                        } // file in subfolder
                                    } // folder in gcc-arm-none-eabiversion
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (folders_1_1 && !folders_1_1.done && (_b = folders_1.return)) yield _b.call(folders_1);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                            } // if subfolder is gcc-arm-none-eabiversion
                        } // for usr folder's subdirectories
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (files_1_1 && !files_1_1.done && (_a = files_1.return)) yield _a.call(files_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                } // windows toolchain
            } // not bz2
        }));
        console.log("finished extraction for " + storagePath);
        return true;
    });
}
exports.extract = extract;
function downloadextract(context, downloadURL, storagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalPath = context.globalStorageUri.fsPath;
        const bz2 = yield download(globalPath, downloadURL, storagePath);
        yield extract(globalPath, storagePath, bz2);
        console.log(`Finished Installing ${storagePath}`);
        vscode_1.window.showInformationMessage(`Finished Installing ${storagePath}`);
        return true;
    });
}
exports.downloadextract = downloadextract;
function chmod(globalPath, system) {
    return __awaiter(this, void 0, void 0, function* () {
        if (system === "windows") {
            return;
        }
        const chmodList = [
            fs.promises.chmod(path.join(globalPath, "install", `pros-cli-${system}`, "pros"), 0o751),
            fs.promises.chmod(path.join(globalPath, "install", `pros-cli-${system}`, "intercept-c++"), 0o751),
            fs.promises.chmod(path.join(globalPath, "install", `pros-cli-${system}`, "intercept-cc"), 0o751),
        ];
        yield Promise.all(chmodList);
    });
}
exports.chmod = chmod;
//# sourceMappingURL=download.js.map