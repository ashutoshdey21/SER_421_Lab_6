console.log('landing.js');

function validate_login() {

    let username = document.getElementById('username').childNodes.item(0).nodeValue;
    let password = document.getElementById('pwd').childNodes.item(0).nodeValue;

}

function getRequestObject() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else {
        return null;
    }
}

function ajaxResult(address) {
    var request = getRequestObject();
    request.onreadystatechange =
        function() { showResponseText(request); };
    request.open("GET", address, true);
    request.send(null);
}