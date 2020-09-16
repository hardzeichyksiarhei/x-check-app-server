class AuthUser {
  static toResponse(user) {
    const { id: githubId, login, avatar_url, email, role } = user;
    return { githubId, login, avatar_url, email, role };
  }
}

module.exports = AuthUser;
