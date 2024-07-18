export function getUserData() {
    return JSON.parse(sessionStorage.getItem('userData') || '{}');
}

export function setUserData(userData: object) {
    sessionStorage.setItem('userData', JSON.stringify(userData));
}

export function deleteUserData() {
    sessionStorage.removeItem('userData');
}
