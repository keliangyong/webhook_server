'use strict';

const Hapi = require('hapi');
const util = require('util');
const cp = require('child_process');

const sh = (cmd, stdin, opts) => new Promise((res, rej) => {
    console.log('>', cmd);
    var child = cp.exec(cmd, opts, err => {
        if(err) rej(err);
        else res();
    });

    if(util.isBuffer(stdin) || util.isString(stdin)) {
        console.log('>>>', stdin.toString());
        child.stdin.end(stdin);
    }
    else if(stdin && util.isFunction(stdin.pipe)) {
        console.log('>>>', '<Stream>');
        stdin.pipe(child.stdin);
    }

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
});

// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: 8000
});

// Add the route
server.route({
    method: 'GET',
    path: '/hello',
    handler: function (request, h) {
        return 'hello world';
    }
});

server.route({
    method: 'POST',
    path: '/webhook/{dir}',
    handler: async function (request, h) {
        const path = encodeURIComponent(request.params.dir)
        try {
            await sh(`cd /project/${path}`);
            await sh('git pull')
        } catch (error) {
            return JSON.stringify(error);
        }
        return `success`;
    }
});

server.route({
    method: 'POST',
    path: '/hexo',
    handler: async function (request, h) {
        try {
            await sh(`cd /project/blog`);
            await sh('hexo clean && hexo g')
        } catch (error) {
            return JSON.stringify(error);
        }
        return `success`;
    }
});

// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();