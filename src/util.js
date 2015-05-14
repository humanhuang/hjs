
//判断是否为数组
function isArray(array){
    return Object.prototype.toString.call(array) == '[object Array]';
}

//转换数组
function makeArray(array){
    return array ? isArray(array) ? array : [array] : [];
}

//简单迭代数组
function each(obj, callback){
    if(isArray(obj)){
        for(var i = 0; i < obj.length; i++)
            callback(obj[i], i);
    }else{
        for(var i in obj)
            callback(obj[i], i);
    }
}

//查找元素是否在数组中
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

//是否函数
function isFunction(callback){
    return typeof callback == 'function';
}