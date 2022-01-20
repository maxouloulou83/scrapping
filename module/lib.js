const fs = require("fs");

// Function pour enregistrer dans un fichier
exports.storeData = function (data, path) {
    try {
        fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
        console.error(err)
    }
}

// Function pour lire dans un fichier
exports.loadData = function (path) {
    try {
        return fs.readFileSync(path, 'utf8')
    } catch (err) {
        console.error(err)
        return false
    }
}

// Function pour lire plusieurs fichier
exports.readFiles = function (dirname, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(dirname + filename, 'utf-8', function(err, content) {
                if (err) {
                    onError(err);
                    return;
                }

                onFileContent(filename, content);
            });
        });
    });
}

// Function qui transform les milli seconds en minutes et seconds
exports.millisToMinutesAndSeconds = function (millis) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);

    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
