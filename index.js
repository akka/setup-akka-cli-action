const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');

function resolveOauthAudience(oauthAudience, oauthProviderOrganizationId, oauthProviderName) {
    if (oauthProviderOrganizationId && !oauthProviderName) {
        throw new Error('oauth-provider-name must be provided when oauth-provider-organization-id is set');
    }
    if (oauthProviderName && !oauthProviderOrganizationId) {
        throw new Error('oauth-provider-organization-id must be provided when oauth-provider-name is set');
    }
    if (oauthAudience && oauthProviderOrganizationId) {
        throw new Error('oauth-audience cannot be used together with oauth-provider-organization-id/oauth-provider-name');
    }
    if (oauthAudience) {
        return oauthAudience;
    }
    if (oauthProviderOrganizationId && oauthProviderName) {
        return `organizations/${oauthProviderOrganizationId}/identityproviders/${oauthProviderName}`;
    }
    return '';
}

async function run() {
    try {
        const token = core.getInput('token', { required: false });
        const projectId = core.getInput('project-id', { required: false });
        const project = core.getInput('project', { required: false });
        const apiServerHost = core.getInput('api-server-host', { required: false });
        const organization = core.getInput('organization', { required: false });
        const oauthAudienceInput = core.getInput('oauth-audience', { required: false });
        const oauthProviderOrganizationId = core.getInput('oauth-provider-organization-id', { required: false });
        const oauthProviderName = core.getInput('oauth-provider-name', { required: false });

        const oauthAudience = resolveOauthAudience(oauthAudienceInput, oauthProviderOrganizationId, oauthProviderName);

        if (token && oauthAudience) {
            throw new Error('token cannot be used together with oauth-audience or oauth-provider-organization-id/oauth-provider-name');
        }
        if (!token && !oauthAudience) {
            throw new Error('Either token, or oauth-audience, or oauth-provider-organization-id and oauth-provider-name must be provided');
        }
        if (projectId && project) {
            throw new Error('project-id cannot be used together with project');
        }
        if (!projectId && !project) {
            throw new Error('Either project-id or project must be provided');
        }

        const runnerTempDir = process.env.RUNNER_TEMP;
        const akkaBin = runnerTempDir + "/akka-bin";
        console.log(`Downloading install-cli script`);
        const scriptPath = await tc.downloadTool('https://doc.akka.io/install-cli.sh');
        console.log(`Downloaded ${scriptPath}`);

        await exec.exec(`chmod +x ${scriptPath}`);

        await exec.exec(`mkdir ${akkaBin}`);
        await exec.exec(`${scriptPath} --prefix ${akkaBin} --yes --verbose`);

        core.addPath(akkaBin);

        console.log(`Configuring Akka CLI...`);
        if (oauthAudience) {
            const idToken = await core.getIDToken(oauthAudience);
            core.setSecret(idToken);
            core.exportVariable('AKKA_OAUTH_TOKEN', idToken);
            core.exportVariable('AKKA_OAUTH_TOKEN_AUDIENCE', oauthAudience);
        } else {
            core.setSecret(token);
            core.exportVariable('AKKA_TOKEN', token);
        }

        if (apiServerHost) {
            core.exportVariable('AKKA_API_HOST', apiServerHost);
        }
        core.exportVariable('AKKA_PROJECT', projectId || project);
        if (organization) {
            core.exportVariable('AKKA_ORGANIZATION', organization);
        }

        await exec.exec(`akka auth current-login`);
        await exec.exec(`akka auth container-registry configure --disable-prompt`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
