module.exports = {
    checkNUllUnD:  (data) => {
        return data === undefined || data === null
            ? 0
            : Number(data)
    },
    checkNUllUnDString:  (data) => {
        return data === undefined || data === null
            ? 0
            : data
    }

}