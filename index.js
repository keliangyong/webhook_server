'use strict';

const Hapi = require('hapi');
const util = require('util');
const { exec } = require('child_process');

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
    path: '/gitpull/{dir}',
    handler: async function (request, h) {
        const path = encodeURIComponent(request.params.dir)
        try {
            exec('cd /project/${path} && git pull origin master', (error, stdout, stderr) => {
                if (error) {
                    return JSON.stringify(error);
                }
                return `stdout: ${stdout}`
              });
        } catch (error) {
            return JSON.stringify(error);
        }
    }
});

server.route({
    method: 'POST',
    path: '/hexo',
    handler: async function (request, h) {
        try {
            exec('cd /project/blog && git pull origin master && hexo clean && hexo g', (error, stdout, stderr) => {
                if (error) {
                    return JSON.stringify(error);
                }
                return `stdout: ${stdout}`
              });
        } catch (error) {
            return JSON.stringify(error);
        }
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