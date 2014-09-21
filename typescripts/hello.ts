/// <reference path="jquery.d.ts" />
import jquery = require('jquery');
console.log(jquery);
jQuery(document).ready(function () {
    $('#btn').on('click', function () {
        hello('Mimorin');
    })
});

function hello(name: string): void {
    console.log('Hello %s, TS world!', name);
}
