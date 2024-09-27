function $(tag, attr, children){
    const t = document.createElement(tag)

    if(attr){
        const keys = Object.keys(attr)
        for(let i=0,l=keys.length; i<l; i++){
            const k = keys[i]
            t[k] = attr[k]
        }
    }

    if(typeof children === "string" || typeof children === "number"){
        t.appendChild(document.createTextNode(children))
    }else if(children){
        t.append(...children)
    }

    return t
}

function join(){
    return Array.from(arguments).map(s => s[0] === "/" ? s.slice(1) : s).join('/')
}

export {
    $,
    join
}