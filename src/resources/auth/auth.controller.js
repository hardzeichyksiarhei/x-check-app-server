const FormData = require("form-data");
const fetch = require("node-fetch");
const catchErrors = require('../../common/catchErrors');
const AuthUser = require('./auth.model');

exports.authenticate = catchErrors(async (req, res) => {
    const { clientId, redirectURI, clientSecret, code, role } = req.body;

    const data = new FormData();
    data.append("client_id", clientId);
    data.append("client_secret", clientSecret);
    data.append("code", code);
    data.append("redirect_uri", redirectURI);

    fetch(`https://github.com/login/oauth/access_token`, {
        method: "POST",
        body: data
    })
        .then(response => response.text())
        .then(paramsString => {
            let params = new URLSearchParams(paramsString);
            const accessToken = params.get("access_token");
            const scope = params.get("scope");
            const tokenType = params.get("token_type");

            return fetch(
                `https://api.github.com/user?access_token=${accessToken}&scope=${scope}&token_type=${tokenType}`
            );
        })
        .then(response => response.json())
        .then(user => {
            return res.status(200).json(AuthUser.toResponse({ ...user, role }));
        })
        .catch(error => {
            return res.status(400).json(error);
        });
});