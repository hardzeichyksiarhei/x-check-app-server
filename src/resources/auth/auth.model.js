class AuthUser {
    static toResponse(user) {
        const { id, login, avatar_url, email, role } = user;
        return { id, login, avatar_url, email, role };
    }
}

module.exports = AuthUser;