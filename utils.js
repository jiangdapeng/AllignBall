function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

function getPointOnCanvas(canvas, x, y) {  
    var bbox = canvas.getBoundingClientRect();  
    return [
    	x - bbox.left * (canvas.width  / bbox.width),  
        y - bbox.top  * (canvas.height / bbox.height)  
    ];  
}  