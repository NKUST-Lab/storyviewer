export default function wrapText (ctx, text, x, y, maxWidth, lineHeight, book_characters, isCustomFace , text_alignment) {
    //根據作業系統設置字型及大小
    let fontStyle = fontStyleDetectOS(text.text_size)
    ctx.font = fontStyle
    //遇到分行符號換行
    for (const words of text.book_text.trim().split('\n')) {
        let line = '';
        for (let [index, w] of words.split(' ').entries()) {
            //每個字都偵測是不是需要替換的字眼
            w = replaceText(w, book_characters, isCustomFace)
            const testLine = line + w + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            //不是最後一行時可以不管對齊
            if (testWidth > maxWidth && index > 0) {
                printLine(ctx, x, y, line, maxWidth , true , text_alignment , fontStyle)
                line = w + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        printLine(ctx, x, y, line, maxWidth, false , text_alignment , fontStyle)
        y += lineHeight
    }
}

//這裡會送來一整行
const printLine = (ctx, x, y, line, maxWidth, is_full_line = true , text_alignment , fontStyle) => {
    //裡面會再把一整行的字串切成一個單字一個單字

    let prevwidth = x
    //為向右對齊時用不同方式畫
    if (text_alignment === 'right') {
        const reversed_line = line.split(' ').reverse()
        for (let word of reversed_line) {
            //粗體設定
            word = makeFontBold(ctx , word , fontStyle)
            prevwidth -= ctx.measureText(' ' + word).width
            ctx.fillText(word, prevwidth, y);
        }
        return
    }

    //向中對齊且為最後一行
    if (!is_full_line && text_alignment === 'center') {
        const lineWidth = ctx.measureText(line).width
        prevwidth = x + (maxWidth - lineWidth) / 2
        for (let word of line.split(' ')) {
            //粗體設定
            word = makeFontBold(ctx , word , fontStyle)
            ctx.fillText(word, prevwidth, y);
            prevwidth += ctx.measureText(word + ' ').width
        }
        return
    }

    //向左對齊 or 中對齊方式但尚未滿行
    for (let word of line.split(' ')) {
        //粗體設定
        word = makeFontBold(ctx , word , fontStyle)
        ctx.fillText(word, prevwidth, y);
        prevwidth += ctx.measureText(word + ' ').width
    }
}

//粗體設定
const makeFontBold = (ctx , word , fontStyle) => {
    ctx.font = fontStyle
    if (word.includes("##")) {
        ctx.font = `bold ${fontStyle}`
        word = word.replaceAll('##', '')
    }
    return word
}

const replaceText = (w, book_characters, isCustomFace) => {
    //改變文字內容 且 為換臉模式
    const replaceregex = /(?<target>@\d+(he_she|him_her|his_her|his_her|himself_herself|He_She|Him_Her|His_Her|His_Hers|Himself_Herself|boy_girl|man_woman|Boy_Girl|Man_Woman|))/
    if (w.includes('@') && isCustomFace) {
        const clean_word = w.match(replaceregex)[1]
        const rolenumber = parseInt(clean_word.match(/@(?<target>\d*)[\S\s]*/)[1])

        // @1 or @2 -> 客戶名稱
        if (/^@\d$/.test(clean_word)) {
            for (const char of book_characters) {
                if (char.character_number === rolenumber) {
                    return w.replace(/@\d+/, `##${char.role_name}##`)
                }
            }
        }

        // @1he_she or @1him_her or @1his_her -> 客戶主詞 受詞 所有 根據客戶性別role_gender 
        if (replaceregex.test(clean_word)) {
            for (const char of book_characters) {
                if (char.character_number === rolenumber) {
                    const replace_word = char.role_gender === "M" 
                    ? clean_word.match(/^@\d*(?<target>\S*)_(?<target2>\S*)/)[1] 
                    : clean_word.match(/^@\d*(?<target>\S*)_(?<target2>\S*)/)[2]
                    return w.replace(replaceregex, replace_word)
                }
            }
        }
    }

    //改變文字內容 且 非換臉模式
    if (w.includes('@') && !isCustomFace) {
        const clean_word = w.match(replaceregex)[1]
        const rolenumber = parseInt(clean_word.match(/@(?<target>\d*)[\S\s]*/)[1])

        // @1 or @2 -> 角色名稱
        if (/^@\d$/.test(clean_word)) {
            for (const char of book_characters) {
                if (char.character_number === rolenumber) {
                    return w.replace(/@\d+/, char.character_name)
                }
            }
        }

        // @1he_she or @1him_her or @1his_her -> 角色主詞 受詞 所有 根據角色性別character_gender
        if (replaceregex.test(clean_word)) {
            for (const char of book_characters) {
                if (char.character_number === rolenumber) {
                    const replace_word = char.gender === "male" 
                    ? clean_word.match(/^@\d*(?<target>\S*)_(?<target2>\S*)/)[1] 
                    : clean_word.match(/^@\d*(?<target>\S*)_(?<target2>\S*)/)[2]
                    return w.replace(replaceregex, replace_word)
                }
            }
        }
    }

    return w
}

const fontStyleDetectOS = (text_size) => {
    const platform = navigator.platform
    //Mac
    if (platform.indexOf("Mac") > -1) {
        return `${text_size}px ChalkboardSE-Light`
    }
    //Windows
    if (platform.indexOf("Win") > -1) {
        return `${text_size}px Chalkboard SE Light`
    }

    //預設字體
    return `${text_size}px Chalkboard SE Light`
}
