const fs = require('fs');

exports.addPlayerPage = (req, res) => {
    res.render('add-player.ejs', {
        title: `Welcome to ${teamName} | Add a new player`,
        message: ''
    });
};

exports.addPlayer = (req, res) => {
    if (!req.files) {
        return res.status(400).send("No files were uploaded.");
    }

    let message = '';
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let position = req.body.position;
    let number = req.body.number;
    let username = req.body.username;
    let uploadedFile = req.files.image;
    let image_name = uploadedFile.name;
    let fileExtension = uploadedFile.mimetype.split('/')[1];
    image_name = username + '.' + fileExtension;

    let usernameQuery = `SELECT * FROM [DemoSqlMangedInstance].[dbo].[players] WHERE [user_name] = '${username}'`;
        
    queryDatabase(usernameQuery).then(result => {
        if (result.length > 0) {
            message = 'Username already exists';
            res.render('add-player.ejs', {
                message,
                title: `Welcome to ${teamName} | Add a new player`
            });
        } else {
            // check the filetype before uploading it
            if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                // upload the file to the /public/assets/img directory
                uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    // send the player's details to the database
                    let insertQuery = `INSERT INTO [DemoSqlMangedInstance].[dbo].[players] ([first_name], [last_name], [position], [number], [image], [user_name]) VALUES ('${first_name}', '${last_name}', '${position}', '${number}', '${image_name}', '${username}')`;
                  
                    queryDatabase(insertQuery).then(result => {
                        res.redirect('/');
                    }).catch(error => {
                        return res.status(500).send(error);
                    });
                });
            } else {
                message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                res.render('add-player.ejs', {
                    message,
                    title: `Welcome to The ${teamName} | Add a new player`
                });
            }
        }
    }).catch(error => {
            // do something with the error
            console.log(error);
            return res.status(500).send(error);
        })


}

exports.editPlayerPage = (req, res) => {
    let playerId = req.params.id;
    let playerIdQuery = `SELECT * FROM [DemoSqlMangedInstance].[dbo].[players] WHERE [id] = '${playerId}'`;

    queryDatabase(playerIdQuery).then(result => {
        res.render('edit-player.ejs', {
            title: "Edit  Player",
            player: result[0],
            message: ''
        });
    }).catch(error => {
            // do something with the error
            return res.status(500).send(error);
        });
}

exports.editPlayer = (req, res) => {
    let playerId = req.params.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let position = req.body.position;
    let number = req.body.number;
    let updateQuery = `UPDATE [DemoSqlMangedInstance].[dbo].[players] SET 
        [first_name] = '${first_name}',
        [last_name] = '${last_name}',
        [position] = '${position}',
        [number] = '${number}'
    WHERE [id] = '${playerId}'`;

    queryDatabase(updateQuery).then(result => {
        res.redirect('/');
    }).catch(error => {
            // do something with the error
            return res.status(500).send(error);
        });
}

exports.deletePlayer = (req, res) => {
    let playerId = req.params.id;
    let getImageQuery = `SELECT image from [DemoSqlMangedInstance].[dbo].[players] WHERE [id] = '${playerId}'`;
    let deleteUserQuery = `DELETE FROM [DemoSqlMangedInstance].[dbo].[players] WHERE [id] = '${playerId}'`;

    queryDatabase(getImageQuery).then(result => {
        let image = result[0].image;
        fs.unlink(`public/assets/img/${image}`, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            
            queryDatabase(deleteUserQuery).then(result => {
                res.redirect('/');
            }).catch(error => {
                    // do something with the error
                    return res.status(500).send(error);
                })
        });
    }).catch(error => {
            // do something with the error
            return res.status(500).send(error);
        });
}
