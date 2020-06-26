export function FormattedSuggestedPrice(price) {
    return ('0000000'+ price).slice(-7).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ') + ' €';
}

export function formatMoney(price){
    //let p = !!(price % 1) 
    return !isNaN(price) ? Number(price).toFixed(2).replace(".", ",") : price;
}