
function isArray(array){
    return Object.prototype.toString.call(array) == '[object Array]';
}

function makeArray(array){
    return array ? isArray(array) ? array : [array] : [];
}

function each(obj, callback){
    if(isArray(obj)){
        for(var i = 0; i < obj.length; i++)
            callback(obj[i], i);
    }else{
        for(var i in obj)
            callback(obj[i], i);
    }
}

function inArray(array, item){
    array = makeArray(array);

    if(array.indexOf){
        return array.indexOf(item) > -1;
    }else{
        for( var i = 0; i < array.length; i++){
            if(array[i] == item) return true;
        }

        return false;
    }
}

function isFunction(callback){
    return typeof callback == 'function';
}