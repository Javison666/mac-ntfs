import { exec } from 'child_process'

class Exec {
    constructor() {}
    run({
        cmd,
        path,
        out,
        err,
        close
    }) {
        let workerProcess
        // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
        if (path) {
            workerProcess = exec(cmd, { cwd: path, encoding: 'utf8' })
        } else {
            // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
            workerProcess = exec(cmd, { encoding: 'utf8' })
        }

        // 打印正常的后台可执行程序输出
        workerProcess.stdout.on('data', function (data) {
            if (out) {
                out(data)
            }
        });

        // 打印错误的后台可执行程序输出
        workerProcess.stderr.on('data', function (data) {
            if (err) {
                err(data)
            }
        });

        // 退出之后的输出
        workerProcess.on('close', function (code) {
            if (close) {
                close(code)
            }
        })
    }
    // 获取信息的命令执行
    info({
        cmd,
        path
    }) {
        return new Promise((resolve, reject) => {
            this.run({
                cmd,
                path,
                out: (data) => {
                    resolve(data)
                },
                err: (data) => {
                    reject(data)
                }
            })
        })
    }
    // 直接执行，执行完后回调的命令执行
    once({
        cmd,
        path
    }) {
        return new Promise((resolve, reject) => {
            this.run({
                cmd,
                path,
                close: (data) => {
                    resolve(data)
                },
                err: (data) => {
                    reject(data)
                }
            })
        })
    }
}

export default new Exec()