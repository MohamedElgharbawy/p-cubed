function getUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function sleep(milliseconds) {
    await new Promise(r => setTimeout(r, milliseconds));
}

export {getUUID, getCookie, sleep}