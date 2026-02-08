/**
 * @deprecated
 */
export function getUserData() {
    return JSON.parse(sessionStorage.getItem('userData') || '{}');
}

/**
 * @deprecated
 */
export function setUserData(userData: object) {
    sessionStorage.setItem('userData', JSON.stringify(userData));
}
