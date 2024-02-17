const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Client } = require('ssh2');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/',function(req,res){
    res.render('login');
})

app.post('/', function (req, res) {
    const username = req.body.username;
    const password = req.body.pass;
    const ip_address = req.body.ip_address;

    // SSH Connection options
    const sshConfig = {
        host: ip_address,
        port: 22,
        username: username,
        password: password
    };

    const conn = new Client();

    // Connect to the SSH server
    conn.on('ready', function () {
        console.log('SSH connection established.');

        // Once connected, you can execute commands
        conn.exec('ls', function (err, stream) {
            if (err) throw err;

            stream.on('close', function (code, signal) {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end(); // Close the connection once done
            }).on('data', function (data) {
                console.log('STDOUT: ' + data);
                // Here you can send data back to the client if needed
            }).stderr.on('data', function (data) {
                console.log('STDERR: ' + data);
                // Handle STDERR data
            });
        });
    }).connect(sshConfig);
});

app.listen(3000, function () {
    console.log('Server is running on port 3000');
});
