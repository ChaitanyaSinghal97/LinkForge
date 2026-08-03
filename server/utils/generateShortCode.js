exports.generateShortCode=()=>{
    let shortCode="";
    const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for(let i=0;i<6;i++){
        const randomIndex=Math.floor(Math.random()*chars.length);
        const randomChar=chars[randomIndex];
        shortCode+=randomChar;
    }
    return shortCode;
};