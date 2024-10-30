const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');

async function run() {
    try {
        const token = core.getInput('token', { required: true });
        const projectId = core.getInput('project-id', { required: true });
        const runnerTempDir = process.env.RUNNER_TEMP;
        const akkaBin = runnerTempDir + "/akka-bin";
        console.log(`Downloading install-cli script`);
        const scriptPath = await tc.downloadTool('https://doc.akka.io/install-cli.sh');
        console.log(`Downloaded ${scriptPath}`);

        await exec.exec(`chmod +x ${scriptPath}`);

        await exec.exec(`mkdir ${akkaBin}`);
        await exec.exec(`${scriptPath} --prefix ${akkaBin} --yes --verbose`);

        core.addPath(akkaBin);

        console.log(`Configuring akka CLI...`);
        await exec.exec(`akka config set project ${projectId}`);
        await exec.exec(`akka config set refresh-token ${token}`);
        await exec.exec(`akka auth container-registry configure --disable-prompt`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();