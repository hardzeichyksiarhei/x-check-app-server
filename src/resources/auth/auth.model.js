class AuthUser {
    static toResponse(user) {
        const { id, login, avatar_url, login, email } = user;
        return { id, login, avatar_url, login, email, role: 'user' };
    }
}