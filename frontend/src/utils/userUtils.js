/**
 * Get the display name for a user.
 * Priority: full_name > username > email prefix > 'Unknown User'
 * @param {Object} user - The user profile object
 * @returns {string} The formatted display name
 */
export const getDisplayName = (user) => {
    if (!user) return 'Unknown User';

    if (user.full_name) return user.full_name;
    if (user.username) return user.username;

    if (user.email) {
        return user.email.split('@')[0];
    }

    return 'Unknown User';
};

/**
 * Get the avatar URL or a generated fallback.
 * @param {Object} user - The user profile object
 * @returns {string} The avatar URL
 */
export const getAvatarUrl = (user) => {
    if (user?.avatar_url) return user.avatar_url;

    const name = getDisplayName(user);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};
