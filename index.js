/**
 * Recasts Word UTF-8 HTML file as Markdown
 * @param {string} data - text to convert
 * @param {string} callback - callback on output
 */
function recast(data, callback) {
    const text = cleanupData(data);
    const footnotes = getFootnotes(text);
    const chapters = text.split('<!-- chapter -->').map(chapter => applyFootnotes(chapter, footnotes));
    callback(chapters);
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

function getAllMatches(re, s) {
    var matches = [];

    do {
        m = re.exec(s);
        if (m) {
            matches.push(m);
        }
    } while (m);
    
    return matches;
}

function getFootnotes(text) {
    let matches = [];
    
    text.replace(
        /\n\[[0-9]+]([\s\S]+?)\n\[?/gm, 
        (match, g1, g2) => matches.push(match)
    );
    
    return matches.reduce((acc, s) => {
        const match = /\n\[([0-9]+)]([\s\S]+?)\n\[?/g.exec(s);
        acc[match[1]] = {index: parseInt(match[1]), text: match[2].trim()};
        return acc;
    }, {});
}

function getFootnoteLinks(text) {
    return getAllMatches(/[^\n]\[([0-9]+)\]/g, text).map(matches => parseInt(matches[1]))   
}

function applyFootnotes(text, footnotes) {
    let links = getFootnoteLinks(text);
    
    // add ^ to the links
    text = text.replace(/([^\n]\[)([0-9]+\])/g, '$1^$2');
    
    // append footnotes to chapter
    if (links.length) {
        text += links.reduce(
            (acc, link) => {
                if (footnotes[link]) {
                    return acc + '\n\n[^' + footnotes[link].index + ']: ' + footnotes[link].text;
                } else {
                    console.error('ERR: missing footnote link');
                    return acc + '\n\n[^' + link + ']: ' + 'ERR: missing footnote link';
                }
            }, ''
        );
    }
    
    return text + '\n';
}

function cleanupData(data) {
    const replacements = [
        // trim body
        [/^[\s\S]+<body[^\n]+/m, ''],
        [/<\/body>[\s\S]+$/m, ''],
        
        //remove style attributes
        [/style='[^']+'/mg, ''],
        [/style="[^"]+"/mg, ''],
        
        // adds newlines after block elements
        [/<\/(div|p)>/gm, '\n\n'],
    
        // remove tags
        [/<\/?(o:p|div|p|span|a)[^>]*>/gm, ''],
    
        // remove and cleanup strings
        [/&nbsp;/gm, ' '],
        [/&amp;/gm, '&'],
        
        // remove conditional comments
        [/<!\[if [^\]]+\]>/gm, ''],
        [/<!\[endif\]>/gm, ''],
        
        // remove trailing space inside tags
        [/\s+>/gm, '>'],
        
        // merge adjacent <i> elements
        [/<\/i><i>/gm, ''],
        
        // remove empty <b> elements
        [/<b>\s*<\/b>/gm, ''],
        
        // remove single newlines, 
        [/\r\n\s*\r\n/g, '°°°'],
        [/[\r\n]/g, ' '],
        [/°+/g, '\n\n'],
        
        // mark chapters
        [/<h1>(.+)<\/h1>/g, '<!-- chapter --># $1'],
        [/<h2>(.+)<\/h2>/g, '## $1'],
        [/<h3>(.+)<\/h3>/g, '### $1'],
        [/<h4>(.+)<\/h4>/g, '#### $1'],
        
        // convert <i> and <b> to markdown
        [/(\s*)<i>(\s*)/g, '$1*'], [/(\s*)<\/i>(\s*)/g, '*$2'],
        [/(\s*)<b>(\s*)/g, '$1**'], [/(\s*)<\/b>(\s*)/g, '**$2'],
        
        // collapse multiple spaces into singles
        [/ +/gm, ' ']
    ];
    
    return replacements.reduce((acc, pair) => acc.replace(pair[0], pair[1]), data);
}

module.exports = recast;
