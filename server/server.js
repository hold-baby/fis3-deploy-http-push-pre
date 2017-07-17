//
// Edited by hold-baby https://github.com/hold-baby
// fis3-deploy-http-push receiver on node.js
//

var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var PORT = parseInt(process.argv[2]) || 8999;

var server = http.createServer(function (req, res) {
    
    function error(err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(err.toString()); //fail
    }

    function next(from, to) {
        fs.readFile(from, function (err, content) {
            if (err) {
                error(err);
            } else {
                fs.writeFile(to, content, function (err) {
                    if (err) {
                        error(err);
                    }
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('0'); //success
                });
            }
        });
    }
    /*
     * 接受一个路径 执行清空操作
     */
    function deleteall(path) {  
	    var files = []; 
	    if(fs.existsSync(path)) {  
	        files = fs.readdirSync(path);  
	        files.forEach(function(file, index) {  
	            var curPath = path + "/" + file;  
	            if(fs.statSync(curPath).isDirectory()) { // recurse  
	                deleteall(curPath);  
	            } else { // delete file  
	                fs.unlinkSync(curPath);  
	            }  
	        });  
	        fs.rmdirSync(path);  
	    }
	    res.writeHead(200, {'content-type': 'text/html'}); 
		res.end('clear');
	};

    if (req.url == '/') {
        // show a file upload form
        res.writeHead(200, {'content-type': 'text/html'});
        res.end('I\'m ready for that, you know.');
    } else if (req.url == '/receiver' && req.method.toLowerCase() == 'post') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                error(err);
            } else {
                var to = fields['to'];
                fs.exists(to, function (exists) {
                    if (exists) {
                        fs.unlink(to, function (err) {
                            next(files.file.path, to); 
                        });
                    } else {
                        fs.exists(path.dirname(to), function (exists) {
                            if (exists) {
                                next(files.file.path, to); 
                            } else {
                                mkdirp(path.dirname(to), 0777, function (err) {
                                    if (err) {
                                        error(err);
                                        return;
                                    }
                                    next(files.file.path, to); 
                                });
                            }
                        });
                    }
                });
            }
        });
    } else if(req.url.split("?")[0] == '/clear' && req.method.toLowerCase() == 'get'){
    	var clearPath = req.url.split("?")[1].split("=")[1];
		deleteall(clearPath)
    } else{
    	res.writeHead(400, {'content-type': 'text/html'});
        res.end('验证错误');
    }
});

server.listen(PORT, function () {
    console.log('receiver listening *:' + PORT);
});
