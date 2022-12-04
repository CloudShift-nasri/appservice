var { Request } = require('tedious');

exports.getHomePage = (req, res) => {
    let getPlayersQuery = `SELECT * FROM DemoSqlMangedInstance.dbo.players ORDER BY id ASC`; // query database to get all the players

    queryDatabase(getPlayersQuery).then(result => {
        res.render('index.ejs', {
            title: `Welcome to ${teamName} | View Players`,
            players: result
        });
    })
        .catch(error => {
            // do something with the error
            return res.status(500).send(error);
        })
};
