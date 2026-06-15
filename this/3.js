'use strict'


function a() {
    console.log(this); // window
}

a.call(null)
a.call(undefined)