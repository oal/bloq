let objectHasKeys = (obj: Object, keys: Array<string>) => keys.filter(key => key in obj).length == keys.length;

export {
    objectHasKeys,
}