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

function inputIntegerCallback(event) {
    $(event.currentTarget).val($(event.currentTarget).val().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));
}

export {getUUID, getCookie, sleep, inputIntegerCallback}