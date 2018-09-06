'use strict';

const Hapi = require('hapi');
const util = require('util');
const { execSync } = require('child_process');

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
        return 'hello world3';
    }
});

server.route({
    method: 'POST',
    path: '/web/{dir}',
    handler: async function (request, h) {
        const dir = encodeURIComponent(request.params.dir)
        try {
            const res = execSync(`cd /project/${dir} && git pull origin master`);
            return res.toString()
        } catch (error) {
            return error.message;
        }
    }
});

server.route({
    method: 'POST',
    path: '/node/{dir}',
    handler: async function (request, h) {
        const dir = encodeURIComponent(request.params.dir)
        try {
            execSync(`cd /project/${dir} && git pull origin master`);
            const res = execSync(`pm2 restart ${dir}`);
            return res.toString()
        } catch (error) {
            return error.message;
        }
    }
});

server.route({
    method: 'POST',
    path: '/hexo/{dir}',
    handler: async function (request, h) {
        const dir = encodeURIComponent(request.params.dir)
        try {
            const res = execSync(`cd /project/${dir} && git pull origin master && hexo clean && hexo g`);
            return res.toString()
        } catch (error) {
            return error.message;
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