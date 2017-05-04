#! /usr/bin/env node
const fs = require('fs');
const rimraf = require('rimraf');
const urlize = require('urlize');
const recast = require('./../index.js');

const cliArgs = require('command-line-args');
const args = cliArgs([
    { name: 'src', type: String },
    { name: 'out', type: String, defaultValue: 'out' }
]);

fs.readFile(args.src, 'UTF-8', (err, data) => {
    if (err) { 
        console.error(err); 
    } else {
        recast(data, chapters => saveFiles(args.out, chapters));
    }
}); 




function saveFiles(dir, chapters) {
    if (fs.existsSync(dir)) rimraf.sync(dir);
    fs.mkdirSync(dir);
    
    chapters.map((chapter, index) => {
        const filename = createFilename(index, chapter);
        
        fs.writeFile(dir+'/'+filename+'.md', chapter, function(err) {
            if (err) return console.log(err);
            console.log('The file "'+filename+'" was saved!');
        }); 
    }) 
}

function createFilename(index, text) {
    return index.toString().padStart(2, '0') + '-' + urlize.urlize(text.split('\n')[0].replace(/^[\s#]+|\s$/g, ''));
}
