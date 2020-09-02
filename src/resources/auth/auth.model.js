class AuthUser {
    static toResponse(user) {
        const { id, login, avatar_url, email } = user;
        return { id, login, avatar_url, email, role: 'user' };
    }
}

module.exports = AuthUser;