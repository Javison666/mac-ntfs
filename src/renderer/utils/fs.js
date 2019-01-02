import fs from 'fs'
class Fs {
    constructor() { }
    //文件的读取
    read({
        path
    }) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data.toString())
                }
            })
        })
    }
    /**
     * 写入文件
     * @param {*text} 文件内容
     * @param {*path} 文件路径
     */
    write({
        text,
        path
    }) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, text, (err) => {
                if (err) reject(err);
                else resolve({ state: true })
            });
        })
    }
    /**
     * 删除文件
     * @param {*path} 文件路径
     */
    del({
        path
    }) {
        return new Promise((resolve, reject) => {
            var files = [];
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                files.forEach((file, index)=>{
                    var curPath = path + "/" + file;
                    if (fs.statSync(curPath).isDirectory()) { // recurse
                        this.del({
                            path:curPath
                        })
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
            resolve()
        })

    }

}

export default new Fs()