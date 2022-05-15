import { NodeSSH, Config } from 'node-ssh';

const ERROR_MESSAGES = {
    missingRequiredParam: (param: string) =>
        `Missing required parameter ${param}`
};

type ScpOptions = {
    /** path of directory to upload source map files from */
    srcPath?: string;
    /** path of directory to upload source map to on the remote machine */
    destPath: string;
    /** node ssh connect config opiotns */
    connect: Config;
};

class WebpackScpPlugin {
    private srcPath: string;
    private destPath: string;
    private connect: Config;
    private sshConnection: NodeSSH | null;

    constructor(options: ScpOptions) {
        this.srcPath = options.srcPath;
        this.destPath = options.destPath;
        this.connect = options.connect;
        this.sshConnection = null;
        this.validateOptions();
    }

    private validateOptions() {
        if (!this.destPath) {
            throw new Error(ERROR_MESSAGES.missingRequiredParam("destPath"));
        }

        if (!this.connect) {
            throw new Error(ERROR_MESSAGES.missingRequiredParam("connect"));
        }
    }

    private async getConnection(): Promise<NodeSSH> {
        if (this.sshConnection) {
            return new Promise((res) => res(this.sshConnection))
        } else {
            const ssh = new NodeSSH();
            await ssh.connect(this.connect);
            this.sshConnection = ssh;
            return this.sshConnection;
        }
    }

    private closeConnection(): void {
        if(this.sshConnection) {
            this.sshConnection.dispose();
            this.sshConnection = null;
        }
    }

    private async uploadSourceMap(fromPath?: string) {
        const sshConnect = await this.getConnection();
        const srcPath = this.srcPath || fromPath;
        await sshConnect.putDirectory(srcPath, this.destPath, {
            concurrency: 10
        });
        this.closeConnection();
    }

    public apply(compiler: any) {
        compiler.hooks.afterEmit.tapPromise(
            "WebpackScpPlugin",
            async (compilation) => { 
                try {
                    console.log(`Upload assets to ${this.connect.host}.`);
                    const { outputPath } = compiler;
                    await this.uploadSourceMap(outputPath);
                } catch (err) {
                    err.message = `WebpackScpPlugin: ${err.message}`;
                    console.error(err.message);
                    compilation.errors.push(err);
                }
            }
        );
    }
}

export = WebpackScpPlugin;
