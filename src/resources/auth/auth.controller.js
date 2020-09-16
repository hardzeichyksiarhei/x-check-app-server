const FormData = require("form-data");
const fetch = require("node-fetch");
const catchErrors = require("../../common/catchErrors");
const AuthUser = require("./auth.model");

exports.authenticate = catchErrors(async (req, res) => {
  const { clientId, redirectURI, clientSecret, code, role } = req.body;

  const data = new FormData();
  data.append("client_id", clientId);
  data.append("client_secret", clientSecret);
  data.append("code", code);
  data.append("redirect_uri", redirectURI);

  try {
    let response;
    let user;

    response = await fetch(`https://github.com/login/oauth/access_token`, {
      method: "POST",
      body: data,
    });
    const paramsString = await response.text();

    let params = new URLSearchParams(paramsString);
    const accessToken = params.get("access_token");
    const scope = params.get("scope");
    const tokenType = params.get("token_type");

    response = await fetch(
      `https://api.github.com/user?access_token=${accessToken}&scope=${scope}&token_type=${tokenType}`
    );
    user = await response.json();

    if (!user) {
      return res.status(403).send({
        auth: false,
        error: "Login failed! Check authentication credentials",
      });
    }

    userResponse = AuthUser.toResponse({ ...user, role });

    // response = await fetch(
    //   `https://x-check-app-rest-server.herokuapp.com/users?githubId=${user.githubId}&role=${user.role}&_limit=1`
    // );
    // [user] = await response.json();

    // if (!user) {
    //   response = await fetch(
    //     `https://x-check-app-rest-server.herokuapp.com/users`,
    //     {
    //       method: "POST",
    //       body: JSON.stringify(user),
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    //   user = await response.json();
    // }

    return res.status(200).json(userResponse);
  } catch (error) {
    return res.status(400).json(error);
  }
});
